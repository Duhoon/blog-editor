-- 작성글 테이블
CREATE TABLE posts (
  id SERIAL PRIMARY KEY NOT NULL,
  title VARCHAR(50) NOT NULL,
  brief VARCHAR(100) DEFAULT NULL,
  content TEXT NOT NULL,
  slug VARCHAR(50) NOT NULL,
  locale VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP DEFAULT NULL,
  thumbnail TEXT DEFAULT NULL,
  is_published BOOLEAN DEFAULT false
);

COMMENT ON TABLE posts IS '작성글 테이블';

-- 251129 이관 작업 중 기존 데이터 중 범위를 벗어나는 데이터 처리 위한 사이즈 변경
ALTER TABLE posts ALTER COLUMN title TYPE character varying(100);

-- 기존 테이블에 ispublished 컬럼이 있으면 한 번만 실행
-- ALTER TABLE posts RENAME COLUMN ispublished TO is_published;

-- 카테고리
CREATE TABLE categories
(
  id VARCHAR(50) PRIMARY KEY NOT NULL,
  name JSONB NOT NULL, -- {"ko": "개발", "en": "Development"}
  description JSONB NOT NULL, -- {"ko": "블라블라", "en": "블라블라"}
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE categories IS '카테고리 분류 테이블';
COMMENT ON TABLE categories.id IS 'DV:개발, MV:영화, MU: 음악, BO: 독서';

-- 카테고리/작성글 맵핑 테이블
CREATE TABLE post_category_links
(
  post_id INT REFERENCES posts(id) NOT NULL,
  category_id VARCHAR(50) REFERENCES categories(id) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (post_id, category_id)
);

COMMENT ON TABLE categories IS '카테고리/작성글 맵핑 테이블';

-- 태그 테이블
CREATE TABLE tags
(
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE tags IS '태그 테이블';

-- 태그/작성글 맵핑 테이블
CREATE TABLE tag_post_links
(
  tag_id INT REFERENCES tags(id) NOT NULL,
  post_id INT REFERENCES posts(id) NOT NULL,
  is_active BOOLEAN NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() 
);

-- 이미지 테이블
CREATE TABLE images
(
  id SERIAL PRIMARY KEY NOT NULL,
  post_id INT REFERENCES posts(id) NOT NULL,
  name VARCHAR(255) NOT NULL,
  mimetype VARCHAR(50) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  width INT NOT NULL,
  height INT NOT NULL,
)

COMMENT ON TABLE images IS '이미지 테이블'
