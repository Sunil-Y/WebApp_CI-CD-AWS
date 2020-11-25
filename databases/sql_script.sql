--
-- PostgreSQL database dump
--

-- Dumped from database version 10.6 (Ubuntu 10.6-0ubuntu0.18.04.1)
-- Dumped by pg_dump version 10.6 (Ubuntu 10.6-0ubuntu0.18.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: users; Type: TABLE; Schema: public; Owner: saurabh
--

CREATE TABLE public.users (
      
    email character varying(30) NOT NULL,
    password character varying(200)
);


-- ALTER TABLE public.users OWNER TO saurabh; Line to Add

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: saurabh
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER TABLE public.users_id_seq OWNER TO saurabh; Line to add

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: saurabh
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: saurabh
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: saurabh
--

COPY public.users (id, email, password) FROM stdin;
\.


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: saurabh
--

SELECT pg_catalog.setval('public.users_id_seq', 1, false);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: saurabh
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: saurabh
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

CREATE TABLE public.notes(id VARCHAR(200) NOT NULL,title VARCHAR(50) NOT NULL,content VARCHAR(50) NOT NULL, user_id INT NOT NULL, created_on TIMESTAMP NOT NULL, last_updated_on TIMESTAMP);

ALTER TABLE ONLY public.notes ALTER COLUMN created_on SET DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE public.attachments(id VARCHAR(200) NOT NULL,url varchar(200),note_id VARCHAR(200) NOT NULL);

ALTER TABLE attachments ADD COLUMN file_name VARCHAR(200);