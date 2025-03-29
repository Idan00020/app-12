SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;
SET default_tablespace = '';
SET default_table_access_method = heap;

CREATE TABLE public.cages (
    id integer NOT NULL,
    name text NOT NULL,
    researcher text NOT NULL,
    status text DEFAULT 'Connected'::text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    stream_url text,
    last_cleaning_time timestamp without time zone,
    cleaning_frequency integer DEFAULT 24,
    cleaning_speed integer DEFAULT 50,
    coordinates point,
    device_id text,
    last_latitude numeric,
    last_longitude numeric,
    last_update_time timestamp without time zone,
    youtube_url text
);

ALTER TABLE public.cages OWNER TO neondb_owner;

CREATE SEQUENCE public.cages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.cages_id_seq OWNER TO neondb_owner;

ALTER SEQUENCE public.cages_id_seq OWNED BY public.cages.id;

ALTER TABLE ONLY public.cages ALTER COLUMN id SET DEFAULT nextval('public.cages_id_seq'::regclass);

ALTER TABLE ONLY public.cages
    ADD CONSTRAINT cages_pkey PRIMARY KEY (id);

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;
