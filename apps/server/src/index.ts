import 'dotenv/config';

import express, { Request, Response } from 'express';
import {logger, log} from './logger';
import { upload } from './utils/multer';
import { supabase } from './external/supabase';

const PORT_NUMBER = 8081;

const app = express();

app.use(log);

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.get("/list", (req: Request, res: Response)=>{
    res.send("Hello World!");
})

app.post(
    "/image", 
    upload.single("image") ,
    async (req: Request, res: Response)=> {
        try {
            const file = req.file;
            if (!file) {
                res.status(400).send();
                return;
            }

            const fileName = `${Date.now()}_${file.originalname}`;

            const { data, error } = await supabase.storage
                .from(process.env.SUPABASE_BUCKET_NAME!)
                .upload(fileName, file.buffer, {
                    contentType: file.mimetype,
                    upsert: false,
                });
            
            if (error) throw error;

            const {data: publicUrlData} = supabase.storage
                .from(process.env.SUPABASE_BUCKET_NAME!)
                .getPublicUrl(fileName)

            res.status(200).json({
                message: "이미지 업로드 완료",
                url: publicUrlData,
            });

            return; 
        } catch(err) {
            if (err instanceof Error){
                console.log(`이미지 업로드에 실패했습니다. ${err.message}`);
            } else {
                console.log(`이미지 업로드에 실패했습니다. ${err}`);
            }

            res.status(500).send();
            return;
        }
    }
)

app.listen(PORT_NUMBER,()=>{
    logger.info(`Running server on ${PORT_NUMBER}`);
})