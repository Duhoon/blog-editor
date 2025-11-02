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
  isPublished BOOLEAN DEFAULT 0
);

COMMENT ON TABLE posts IS '작성글 테이블';

-- 카테고리
CREATE TABLE categories
(
  id VARCHAR(5) PRIMARY KEY NOT NULL,
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
  post_id INT NOT NULL,
  category_id VARCHAR(5) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (post_id, category_id)
);

COMMENT ON TABLE categories IS '카테고리/작성글 맵핑 테이블';

-- 태그 테이블
CREATE TABLE tags
(
  id SERIAL PRIMARY KEY,
  name TEXT PRIMARY KEY NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE tags IS '태그 테이블';

-- 태그/작성글 맵핑 테이블
CREATE TABLE tag_post_links
(
  tag_id INT NOT NULL,
  post_id INT NOT NULL,
  is_active INT NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() 
);
