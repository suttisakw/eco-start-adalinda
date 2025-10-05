


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."calculate_data_quality_score"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    score INTEGER := 0;
BEGIN
    -- Base score for having core fields
    IF NEW.category IS NOT NULL THEN score := score + 20; END IF;
    IF NEW.brand IS NOT NULL AND NEW.brand != '' THEN score := score + 20; END IF;
    IF NEW.model IS NOT NULL AND NEW.model != '' THEN score := score + 20; END IF;
    IF NEW.energy_efficiency_level IS NOT NULL THEN score := score + 15; END IF;
    IF NEW.annual_electricity_cost IS NOT NULL THEN score := score + 10; END IF;
    IF NEW.co2_reduction IS NOT NULL THEN score := score + 10; END IF;
    
    -- Bonus for category-specific fields
    CASE NEW.category
        WHEN 'air' THEN
            IF NEW.capacity_btu IS NOT NULL THEN score := score + 5; END IF;
        WHEN 'ref' THEN
            IF NEW.capacity_liters IS NOT NULL THEN score := score + 5; END IF;
        WHEN 'washer' THEN
            IF NEW.capacity_kg IS NOT NULL THEN score := score + 5; END IF;
        WHEN 'tvp' THEN
            IF NEW.screen_size_inches IS NOT NULL THEN score := score + 5; END IF;
        ELSE
            -- Default bonus for other categories
            score := score + 5;
    END CASE;
    
    NEW.data_quality_score := LEAST(score, 100);
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."calculate_data_quality_score"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_match_confidence"("egat_brand" "text", "egat_model" "text", "shopee_name" "text", "shopee_brand" "text", "shopee_model" "text") RETURNS numeric
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    confidence numeric := 0.0;
    brand_match boolean := false;
    model_match boolean := false;
BEGIN
    -- Brand matching (case insensitive)
    IF LOWER(COALESCE(egat_brand, '')) = LOWER(COALESCE(shopee_brand, '')) THEN
        brand_match := true;
        confidence := confidence + 0.4;
    ELSIF LOWER(COALESCE(egat_brand, '')) != '' AND LOWER(COALESCE(shopee_name, '')) LIKE '%' || LOWER(egat_brand) || '%' THEN
        brand_match := true;
        confidence := confidence + 0.3;
    END IF;
    
    -- Model matching (case insensitive)
    IF LOWER(COALESCE(egat_model, '')) = LOWER(COALESCE(shopee_model, '')) THEN
        model_match := true;
        confidence := confidence + 0.4;
    ELSIF LOWER(COALESCE(egat_model, '')) != '' AND LOWER(COALESCE(shopee_name, '')) LIKE '%' || LOWER(egat_model) || '%' THEN
        model_match := true;
        confidence := confidence + 0.3;
    END IF;
    
    -- Bonus for both brand and model match
    IF brand_match AND model_match THEN
        confidence := confidence + 0.2;
    END IF;
    
    -- Ensure confidence is between 0 and 1
    confidence := LEAST(confidence, 1.0);
    
    RETURN confidence;
END;
$$;


ALTER FUNCTION "public"."calculate_match_confidence"("egat_brand" "text", "egat_model" "text", "shopee_name" "text", "shopee_brand" "text", "shopee_model" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."clean_egat_product_data"("product_data" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    cleaned_data JSONB := '{}';
    allowed_fields TEXT[] := ARRAY[
        'category', 'sequence_number', 'brand', 'model', 'energy_efficiency_level',
        'annual_electricity_cost', 'co2_reduction', 'capacity_btu', 'efficiency_btu_watt',
        'air_type', 'capacity_liters', 'efficiency_units_per_year', 'door_count',
        'capacity_cubic_feet', 'capacity_kg', 'washing_programs', 'efficiency_watt_hour_kg',
        'washer_type', 'power_watt', 'efficiency_percentage', 'electricity_cost_per_hour',
        'screen_type', 'screen_size_inches', 'efficiency_watt_sqrt_m2', 'raw_data', 'scraped_at'
    ];
    field TEXT;
    field_value TEXT;
BEGIN
    -- Only include allowed fields
    FOREACH field IN ARRAY allowed_fields
    LOOP
        IF product_data ? field THEN
            field_value := product_data ->> field;
            
            -- Skip null or empty values
            IF field_value IS NOT NULL AND field_value != '' THEN
                -- Type conversion for numeric fields
                IF field IN ('sequence_number', 'door_count') THEN
                    BEGIN
                        cleaned_data := cleaned_data || jsonb_build_object(field, (field_value::INTEGER));
                    EXCEPTION WHEN OTHERS THEN
                        -- Skip invalid numeric values
                        CONTINUE;
                    END;
                ELSIF field IN ('annual_electricity_cost', 'co2_reduction', 'capacity_btu', 
                               'efficiency_btu_watt', 'capacity_liters', 'efficiency_units_per_year',
                               'capacity_cubic_feet', 'capacity_kg', 'efficiency_watt_hour_kg',
                               'power_watt', 'efficiency_percentage', 'electricity_cost_per_hour',
                               'screen_size_inches', 'efficiency_watt_sqrt_m2') THEN
                    BEGIN
                        cleaned_data := cleaned_data || jsonb_build_object(field, (field_value::NUMERIC));
                    EXCEPTION WHEN OTHERS THEN
                        -- Skip invalid numeric values
                        CONTINUE;
                    END;
                ELSE
                    -- String fields
                    cleaned_data := cleaned_data || jsonb_build_object(field, field_value);
                END IF;
            END IF;
        END IF;
    END LOOP;
    
    -- Ensure scraped_at is set
    IF NOT (cleaned_data ? 'scraped_at') THEN
        cleaned_data := cleaned_data || jsonb_build_object('scraped_at', NOW()::TEXT);
    END IF;
    
    RETURN cleaned_data;
END;
$$;


ALTER FUNCTION "public"."clean_egat_product_data"("product_data" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_old_egat_products"("days_old" integer DEFAULT 90) RETURNS integer
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM egat_products 
    WHERE scraped_at < NOW() - INTERVAL '1 day' * days_old;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Also cleanup old scraping logs
    DELETE FROM egat_scraping_logs
    WHERE scraped_at < NOW() - INTERVAL '1 day' * (days_old * 2);
    
    RETURN deleted_count;
END;
$$;


ALTER FUNCTION "public"."cleanup_old_egat_products"("days_old" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_egat_scraping_stats"() RETURNS TABLE("total_products" bigint, "total_categories" bigint, "total_brands" bigint, "avg_quality_score" numeric, "last_scraped_at" timestamp with time zone, "products_scraped_today" bigint, "products_scraped_this_week" bigint)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_products,
        COUNT(DISTINCT category) as total_categories,
        COUNT(DISTINCT brand) FILTER (WHERE brand IS NOT NULL AND brand != '') as total_brands,
        AVG(data_quality_score) as avg_quality_score,
        MAX(scraped_at) as last_scraped_at,
        COUNT(CASE WHEN DATE(scraped_at) = CURRENT_DATE THEN 1 END) as products_scraped_today,
        COUNT(CASE WHEN scraped_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as products_scraped_this_week
    FROM egat_products;
END;
$$;


ALTER FUNCTION "public"."get_egat_scraping_stats"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, role)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'first_name', 
    new.raw_user_meta_data->>'last_name',
    COALESCE(new.raw_user_meta_data->>'role', 'viewer')
  );
  
  RETURN new;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_scraping_activity"("session_id" "uuid", "category_name" character varying, "status_name" character varying, "products_scraped_count" integer DEFAULT 0, "products_saved_count" integer DEFAULT 0, "error_msg" "text" DEFAULT NULL::"text", "duration_sec" integer DEFAULT NULL::integer, "metadata_json" "jsonb" DEFAULT NULL::"jsonb") RETURNS bigint
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    log_id BIGINT;
BEGIN
    INSERT INTO egat_scraping_logs (
        scraping_session_id,
        category,
        status,
        products_scraped,
        products_saved,
        error_message,
        duration_seconds,
        metadata
    ) VALUES (
        session_id,
        category_name,
        status_name,
        products_scraped_count,
        products_saved_count,
        error_msg,
        duration_sec,
        metadata_json
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$;


ALTER FUNCTION "public"."log_scraping_activity"("session_id" "uuid", "category_name" character varying, "status_name" character varying, "products_scraped_count" integer, "products_saved_count" integer, "error_msg" "text", "duration_sec" integer, "metadata_json" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."safe_insert_egat_products"("products_json" "jsonb") RETURNS TABLE("inserted_count" integer, "error_count" integer, "errors" "text"[])
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    product JSONB;
    cleaned_product JSONB;
    insert_errors TEXT[] := '{}';
    inserted_count INTEGER := 0;
    error_count INTEGER := 0;
BEGIN
    -- Process each product
    FOR product IN SELECT jsonb_array_elements(products_json)
    LOOP
        BEGIN
            -- Clean and validate the product data
            cleaned_product := clean_egat_product_data(product);
            
            IF validate_egat_product_data(cleaned_product) THEN
                -- Insert the cleaned product
                INSERT INTO egat_products (
                    category, sequence_number, brand, model, energy_efficiency_level,
                    annual_electricity_cost, co2_reduction, capacity_btu, efficiency_btu_watt,
                    air_type, capacity_liters, efficiency_units_per_year, door_count,
                    capacity_cubic_feet, capacity_kg, washing_programs, efficiency_watt_hour_kg,
                    washer_type, power_watt, efficiency_percentage, electricity_cost_per_hour,
                    screen_type, screen_size_inches, efficiency_watt_sqrt_m2, raw_data, scraped_at
                ) VALUES (
                    cleaned_product ->> 'category',
                    (cleaned_product ->> 'sequence_number')::INTEGER,
                    cleaned_product ->> 'brand',
                    cleaned_product ->> 'model',
                    cleaned_product ->> 'energy_efficiency_level',
                    (cleaned_product ->> 'annual_electricity_cost')::NUMERIC,
                    (cleaned_product ->> 'co2_reduction')::NUMERIC,
                    (cleaned_product ->> 'capacity_btu')::NUMERIC,
                    (cleaned_product ->> 'efficiency_btu_watt')::NUMERIC,
                    cleaned_product ->> 'air_type',
                    (cleaned_product ->> 'capacity_liters')::NUMERIC,
                    (cleaned_product ->> 'efficiency_units_per_year')::NUMERIC,
                    (cleaned_product ->> 'door_count')::INTEGER,
                    (cleaned_product ->> 'capacity_cubic_feet')::NUMERIC,
                    (cleaned_product ->> 'capacity_kg')::NUMERIC,
                    cleaned_product ->> 'washing_programs',
                    (cleaned_product ->> 'efficiency_watt_hour_kg')::NUMERIC,
                    cleaned_product ->> 'washer_type',
                    (cleaned_product ->> 'power_watt')::NUMERIC,
                    (cleaned_product ->> 'efficiency_percentage')::NUMERIC,
                    (cleaned_product ->> 'electricity_cost_per_hour')::NUMERIC,
                    cleaned_product ->> 'screen_type',
                    (cleaned_product ->> 'screen_size_inches')::NUMERIC,
                    (cleaned_product ->> 'efficiency_watt_sqrt_m2')::NUMERIC,
                    cleaned_product -> 'raw_data',
                    (cleaned_product ->> 'scraped_at')::TIMESTAMP WITH TIME ZONE
                )
                ON CONFLICT (category, brand, model) DO UPDATE SET
                    sequence_number = EXCLUDED.sequence_number,
                    energy_efficiency_level = EXCLUDED.energy_efficiency_level,
                    annual_electricity_cost = EXCLUDED.annual_electricity_cost,
                    co2_reduction = EXCLUDED.co2_reduction,
                    updated_at = NOW();
                
                inserted_count := inserted_count + 1;
            ELSE
                error_count := error_count + 1;
                insert_errors := array_append(insert_errors, 'Validation failed for product: ' || product::TEXT);
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            error_count := error_count + 1;
            insert_errors := array_append(insert_errors, 'Insert failed: ' || SQLERRM || ' for product: ' || product::TEXT);
        END;
    END LOOP;
    
    RETURN QUERY SELECT inserted_count, error_count, insert_errors;
END;
$$;


ALTER FUNCTION "public"."safe_insert_egat_products"("products_json" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_egat_products"("search_query" "text", "category_filter" character varying DEFAULT NULL::character varying, "efficiency_filter" character varying DEFAULT NULL::character varying, "limit_count" integer DEFAULT 50) RETURNS TABLE("id" bigint, "category" character varying, "brand" character varying, "model" character varying, "energy_efficiency_level" character varying, "annual_electricity_cost" numeric, "co2_reduction" numeric, "data_quality_score" integer, "rank" real)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.category,
        p.brand,
        p.model,
        p.energy_efficiency_level,
        p.annual_electricity_cost,
        p.co2_reduction,
        p.data_quality_score,
        ts_rank(p.search_vector, plainto_tsquery('simple', search_query)) as rank
    FROM egat_products p
    WHERE 
        (search_query IS NULL OR p.search_vector @@ plainto_tsquery('simple', search_query))
        AND (category_filter IS NULL OR p.category = category_filter)
        AND (efficiency_filter IS NULL OR p.energy_efficiency_level = efficiency_filter)
    ORDER BY 
        ts_rank(p.search_vector, plainto_tsquery('simple', search_query)) DESC,
        p.data_quality_score DESC
    LIMIT limit_count;
END;
$$;


ALTER FUNCTION "public"."search_egat_products"("search_query" "text", "category_filter" character varying, "efficiency_filter" character varying, "limit_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_match_confidence"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    egat_brand text;
    egat_model text;
    shopee_name text;
    shopee_brand text;
    shopee_model text;
BEGIN
    -- Get EGAT product data
    SELECT brand, model INTO egat_brand, egat_model
    FROM public.egat_products
    WHERE id = NEW.egat_product_id;
    
    -- Get Shopee product data
    SELECT name, brand, model INTO shopee_name, shopee_brand, shopee_model
    FROM public.shopee_products
    WHERE shopee_product_id = NEW.shopee_product_id;
    
    -- Calculate and update confidence
    NEW.match_confidence := public.calculate_match_confidence(
        egat_brand, egat_model, shopee_name, shopee_brand, shopee_model
    );
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_match_confidence"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_search_vector"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Use 'simple' configuration which works with all languages including Thai
    NEW.search_vector := to_tsvector('simple', 
        COALESCE(NEW.brand, '') || ' ' ||
        COALESCE(NEW.model, '') || ' ' ||
        COALESCE(NEW.category, '') || ' ' ||
        COALESCE(NEW.air_type, '') || ' ' ||
        COALESCE(NEW.washer_type, '') || ' ' ||
        COALESCE(NEW.screen_type, '')
    );
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_search_vector"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_egat_product_data"("product_data" "jsonb") RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    required_fields TEXT[] := ARRAY['category'];
    field TEXT;
BEGIN
    -- Check required fields
    FOREACH field IN ARRAY required_fields
    LOOP
        IF NOT (product_data ? field) OR (product_data ->> field) IS NULL THEN
            RAISE NOTICE 'Missing required field: %', field;
            RETURN FALSE;
        END IF;
    END LOOP;
    
    -- Validate category values
    IF NOT (product_data ->> 'category') = ANY(ARRAY['air', 'dryer', 'tvp', 'washer', 'micro', 'heat', 'ref']) THEN
        RAISE NOTICE 'Invalid category: %', (product_data ->> 'category');
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."validate_egat_product_data"("product_data" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."verify_migration_setup"() RETURNS TABLE("check_name" "text", "status" "text", "details" "text")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Check if tables exist
    RETURN QUERY
    SELECT 
        'Tables Created' as check_name,
        CASE WHEN COUNT(*) = 2 THEN 'PASS' ELSE 'FAIL' END as status,
        'Found ' || COUNT(*) || ' tables (expected 2)' as details
    FROM information_schema.tables 
    WHERE table_name IN ('egat_products', 'egat_scraping_logs');
    
    -- Check if indexes exist
    RETURN QUERY
    SELECT 
        'Indexes Created' as check_name,
        CASE WHEN COUNT(*) >= 10 THEN 'PASS' ELSE 'FAIL' END as status,
        'Found ' || COUNT(*) || ' indexes' as details
    FROM pg_indexes 
    WHERE tablename IN ('egat_products', 'egat_scraping_logs');
    
    -- Check if functions exist
    RETURN QUERY
    SELECT 
        'Functions Created' as check_name,
        CASE WHEN COUNT(*) >= 5 THEN 'PASS' ELSE 'FAIL' END as status,
        'Found ' || COUNT(*) || ' functions' as details
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' 
    AND p.proname LIKE '%egat%' OR p.proname LIKE '%update_%';
    
    -- Check sample data
    RETURN QUERY
    SELECT 
        'Sample Data' as check_name,
        CASE WHEN COUNT(*) > 0 THEN 'PASS' ELSE 'FAIL' END as status,
        'Found ' || COUNT(*) || ' sample records' as details
    FROM egat_products;
    
END;
$$;


ALTER FUNCTION "public"."verify_migration_setup"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."egat_products" (
    "id" bigint NOT NULL,
    "category" character varying(50) NOT NULL,
    "sequence_number" integer,
    "brand" character varying(100),
    "model" character varying(100),
    "energy_efficiency_level" character varying(10),
    "annual_electricity_cost" numeric(12,2),
    "co2_reduction" numeric(10,2),
    "capacity_btu" numeric(10,2),
    "efficiency_btu_watt" numeric(10,2),
    "air_type" character varying(100),
    "capacity_liters" numeric(10,2),
    "efficiency_units_per_year" numeric(10,2),
    "door_count" integer,
    "capacity_cubic_feet" numeric(10,2),
    "capacity_kg" numeric(10,2),
    "washing_programs" "text",
    "efficiency_watt_hour_kg" numeric(10,2),
    "washer_type" character varying(100),
    "power_watt" numeric(10,2),
    "efficiency_percentage" numeric(5,2),
    "electricity_cost_per_hour" numeric(10,2),
    "screen_type" character varying(100),
    "screen_size_inches" numeric(5,2),
    "efficiency_watt_sqrt_m2" numeric(10,2),
    "raw_data" "jsonb",
    "scraped_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "is_verified" boolean DEFAULT false,
    "data_quality_score" integer DEFAULT 0,
    "search_vector" "tsvector",
    CONSTRAINT "chk_category" CHECK ((("category")::"text" = ANY ((ARRAY['air'::character varying, 'dryer'::character varying, 'tvp'::character varying, 'washer'::character varying, 'micro'::character varying, 'heat'::character varying, 'ref'::character varying])::"text"[]))),
    CONSTRAINT "chk_energy_efficiency" CHECK ((("energy_efficiency_level")::"text" = ANY ((ARRAY['A'::character varying, 'B'::character varying, 'C'::character varying, 'D'::character varying, 'E'::character varying, 'F'::character varying, 'G'::character varying, NULL::character varying])::"text"[]))),
    CONSTRAINT "egat_products_data_quality_score_check" CHECK ((("data_quality_score" >= 0) AND ("data_quality_score" <= 100)))
);


ALTER TABLE "public"."egat_products" OWNER TO "postgres";


COMMENT ON TABLE "public"."egat_products" IS 'EGAT Label No.5 products with unified schema for all categories';



COMMENT ON COLUMN "public"."egat_products"."category" IS 'Product category: air, ref, washer, heat, dryer, micro, tvp';



COMMENT ON COLUMN "public"."egat_products"."raw_data" IS 'Original scraped data in JSON format';



COMMENT ON COLUMN "public"."egat_products"."scraped_at" IS 'When the data was scraped from EGAT website';



COMMENT ON COLUMN "public"."egat_products"."data_quality_score" IS 'Data quality score from 0-100 based on completeness';



COMMENT ON COLUMN "public"."egat_products"."search_vector" IS 'Full-text search vector for Thai language search';



CREATE OR REPLACE VIEW "public"."egat_brand_stats" AS
 SELECT "brand",
    "count"(*) AS "total_products",
    "count"(DISTINCT "category") AS "categories_covered",
    "count"(DISTINCT "model") AS "unique_models",
    "avg"("annual_electricity_cost") AS "avg_annual_electricity_cost",
    "avg"("co2_reduction") AS "avg_co2_reduction",
    "avg"("data_quality_score") AS "avg_data_quality_score",
    "max"("scraped_at") AS "last_scraped_at",
    "array_agg"(DISTINCT "category" ORDER BY "category") AS "categories"
   FROM "public"."egat_products"
  WHERE (("brand" IS NOT NULL) AND (("brand")::"text" <> ''::"text"))
  GROUP BY "brand"
  ORDER BY ("count"(*)) DESC;


ALTER VIEW "public"."egat_brand_stats" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."egat_category_stats" AS
 SELECT "category",
    "count"(*) AS "total_products",
    "count"(DISTINCT "brand") AS "unique_brands",
    "count"(DISTINCT "model") AS "unique_models",
    "avg"("annual_electricity_cost") AS "avg_annual_electricity_cost",
    "avg"("co2_reduction") AS "avg_co2_reduction",
    "avg"("data_quality_score") AS "avg_data_quality_score",
    "count"(
        CASE
            WHEN (("energy_efficiency_level")::"text" = 'A'::"text") THEN 1
            ELSE NULL::integer
        END) AS "efficiency_a_count",
    "count"(
        CASE
            WHEN (("energy_efficiency_level")::"text" = 'B'::"text") THEN 1
            ELSE NULL::integer
        END) AS "efficiency_b_count",
    "count"(
        CASE
            WHEN (("energy_efficiency_level")::"text" = 'C'::"text") THEN 1
            ELSE NULL::integer
        END) AS "efficiency_c_count",
    "count"(
        CASE
            WHEN (("energy_efficiency_level")::"text" = 'D'::"text") THEN 1
            ELSE NULL::integer
        END) AS "efficiency_d_count",
    "count"(
        CASE
            WHEN (("energy_efficiency_level")::"text" = 'E'::"text") THEN 1
            ELSE NULL::integer
        END) AS "efficiency_e_count",
    "max"("scraped_at") AS "last_scraped_at",
    "min"("scraped_at") AS "first_scraped_at"
   FROM "public"."egat_products"
  GROUP BY "category"
  ORDER BY ("count"(*)) DESC;


ALTER VIEW "public"."egat_category_stats" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."egat_daily_scraping_summary" AS
 SELECT "date"("scraped_at") AS "scraping_date",
    "count"(*) AS "products_scraped",
    "count"(DISTINCT "category") AS "categories_scraped",
    "count"(DISTINCT "brand") AS "brands_scraped",
    "avg"("data_quality_score") AS "avg_quality_score",
    "min"("scraped_at") AS "first_scrape_time",
    "max"("scraped_at") AS "last_scrape_time"
   FROM "public"."egat_products"
  WHERE ("scraped_at" IS NOT NULL)
  GROUP BY ("date"("scraped_at"))
  ORDER BY ("date"("scraped_at")) DESC;


ALTER VIEW "public"."egat_daily_scraping_summary" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."egat_products_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."egat_products_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."egat_products_id_seq" OWNED BY "public"."egat_products"."id";



CREATE TABLE IF NOT EXISTS "public"."egat_scraping_logs" (
    "id" bigint NOT NULL,
    "scraping_session_id" "uuid" DEFAULT "extensions"."uuid_generate_v4"(),
    "category" character varying(50),
    "status" character varying(20) NOT NULL,
    "products_scraped" integer DEFAULT 0,
    "products_saved" integer DEFAULT 0,
    "error_message" "text",
    "duration_seconds" integer,
    "scraped_at" timestamp with time zone DEFAULT "now"(),
    "metadata" "jsonb",
    CONSTRAINT "egat_scraping_logs_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['started'::character varying, 'completed'::character varying, 'failed'::character varying, 'partial'::character varying])::"text"[])))
);


ALTER TABLE "public"."egat_scraping_logs" OWNER TO "postgres";


COMMENT ON TABLE "public"."egat_scraping_logs" IS 'Logs for tracking scraping activities and monitoring';



CREATE SEQUENCE IF NOT EXISTS "public"."egat_scraping_logs_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."egat_scraping_logs_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."egat_scraping_logs_id_seq" OWNED BY "public"."egat_scraping_logs"."id";



CREATE TABLE IF NOT EXISTS "public"."product_matches" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "egat_product_id" bigint,
    "shopee_product_id" "text",
    "match_confidence" numeric(3,2) DEFAULT 0.0,
    "match_type" "text" NOT NULL,
    "match_score" numeric(5,2) DEFAULT 0.0,
    "is_verified" boolean DEFAULT false,
    "verified_by" "uuid",
    "verified_at" timestamp with time zone,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "product_matches_match_confidence_check" CHECK ((("match_confidence" >= 0.0) AND ("match_confidence" <= 1.0))),
    CONSTRAINT "product_matches_match_type_check" CHECK (("match_type" = ANY (ARRAY['exact'::"text", 'similar'::"text", 'manual'::"text"])))
);


ALTER TABLE "public"."product_matches" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "first_name" "text",
    "last_name" "text",
    "phone" "text",
    "avatar_url" "text",
    "role" "text" DEFAULT 'viewer'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'editor'::"text", 'viewer'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."shopee_products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "shopee_product_id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "price" numeric(12,2) NOT NULL,
    "original_price" numeric(12,2),
    "discount_percentage" numeric(5,2),
    "rating" numeric(3,2),
    "review_count" integer DEFAULT 0,
    "image_urls" "text"[],
    "shopee_url" "text" NOT NULL,
    "category" "text",
    "brand" "text",
    "model" "text",
    "specifications" "jsonb",
    "status" "text" DEFAULT 'active'::"text",
    "is_featured" boolean DEFAULT false,
    "is_flash_sale" boolean DEFAULT false,
    "flash_sale_end_time" timestamp with time zone,
    "meta_title" "text",
    "meta_description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "shopee_products_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'inactive'::"text", 'out_of_stock'::"text"])))
);


ALTER TABLE "public"."shopee_products" OWNER TO "postgres";


ALTER TABLE ONLY "public"."egat_products" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."egat_products_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."egat_scraping_logs" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."egat_scraping_logs_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."egat_products"
    ADD CONSTRAINT "egat_products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."egat_scraping_logs"
    ADD CONSTRAINT "egat_scraping_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_matches"
    ADD CONSTRAINT "product_matches_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."shopee_products"
    ADD CONSTRAINT "shopee_products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."shopee_products"
    ADD CONSTRAINT "shopee_products_shopee_product_id_key" UNIQUE ("shopee_product_id");



ALTER TABLE ONLY "public"."egat_products"
    ADD CONSTRAINT "unique_egat_product" UNIQUE ("category", "brand", "model");



CREATE INDEX "idx_egat_products_brand" ON "public"."egat_products" USING "btree" ("brand");



CREATE INDEX "idx_egat_products_brand_model" ON "public"."egat_products" USING "btree" ("brand", "model");



CREATE INDEX "idx_egat_products_category" ON "public"."egat_products" USING "btree" ("category");



CREATE INDEX "idx_egat_products_category_brand" ON "public"."egat_products" USING "btree" ("category", "brand");



CREATE INDEX "idx_egat_products_category_efficiency" ON "public"."egat_products" USING "btree" ("category", "energy_efficiency_level");



CREATE INDEX "idx_egat_products_created_at" ON "public"."egat_products" USING "btree" ("created_at");



CREATE INDEX "idx_egat_products_energy_efficiency" ON "public"."egat_products" USING "btree" ("energy_efficiency_level");



CREATE INDEX "idx_egat_products_model" ON "public"."egat_products" USING "btree" ("model");



CREATE INDEX "idx_egat_products_raw_data_gin" ON "public"."egat_products" USING "gin" ("raw_data");



CREATE INDEX "idx_egat_products_scraped_at" ON "public"."egat_products" USING "btree" ("scraped_at");



CREATE INDEX "idx_egat_products_search" ON "public"."egat_products" USING "gin" ("search_vector");



CREATE INDEX "idx_egat_scraping_logs_category" ON "public"."egat_scraping_logs" USING "btree" ("category");



CREATE INDEX "idx_egat_scraping_logs_scraped_at" ON "public"."egat_scraping_logs" USING "btree" ("scraped_at");



CREATE INDEX "idx_egat_scraping_logs_session" ON "public"."egat_scraping_logs" USING "btree" ("scraping_session_id");



CREATE INDEX "idx_egat_scraping_logs_status" ON "public"."egat_scraping_logs" USING "btree" ("status");



CREATE INDEX "idx_product_matches_confidence" ON "public"."product_matches" USING "btree" ("match_confidence");



CREATE INDEX "idx_product_matches_egat_product_id" ON "public"."product_matches" USING "btree" ("egat_product_id");



CREATE INDEX "idx_product_matches_shopee_product_id" ON "public"."product_matches" USING "btree" ("shopee_product_id");



CREATE INDEX "idx_product_matches_verified" ON "public"."product_matches" USING "btree" ("is_verified");



CREATE INDEX "idx_profiles_role" ON "public"."profiles" USING "btree" ("role");



CREATE INDEX "idx_profiles_user_id" ON "public"."profiles" USING "btree" ("user_id");



CREATE INDEX "idx_shopee_products_brand" ON "public"."shopee_products" USING "btree" ("brand");



CREATE INDEX "idx_shopee_products_category" ON "public"."shopee_products" USING "btree" ("category");



CREATE INDEX "idx_shopee_products_featured" ON "public"."shopee_products" USING "btree" ("is_featured");



CREATE INDEX "idx_shopee_products_shopee_id" ON "public"."shopee_products" USING "btree" ("shopee_product_id");



CREATE INDEX "idx_shopee_products_status" ON "public"."shopee_products" USING "btree" ("status");



CREATE OR REPLACE TRIGGER "calculate_egat_products_quality_score" BEFORE INSERT OR UPDATE ON "public"."egat_products" FOR EACH ROW EXECUTE FUNCTION "public"."calculate_data_quality_score"();



CREATE OR REPLACE TRIGGER "update_egat_products_search_vector" BEFORE INSERT OR UPDATE ON "public"."egat_products" FOR EACH ROW EXECUTE FUNCTION "public"."update_search_vector"();



CREATE OR REPLACE TRIGGER "update_egat_products_updated_at" BEFORE UPDATE ON "public"."egat_products" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_product_match_confidence" BEFORE INSERT OR UPDATE ON "public"."product_matches" FOR EACH ROW EXECUTE FUNCTION "public"."update_match_confidence"();



ALTER TABLE ONLY "public"."product_matches"
    ADD CONSTRAINT "product_matches_egat_product_id_fkey" FOREIGN KEY ("egat_product_id") REFERENCES "public"."egat_products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_matches"
    ADD CONSTRAINT "product_matches_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "anon_read_access" ON "public"."egat_products" FOR SELECT TO "anon" USING (true);



CREATE POLICY "authenticated_insert_access" ON "public"."egat_products" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "authenticated_logs_read" ON "public"."egat_scraping_logs" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "authenticated_read_access" ON "public"."egat_products" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."egat_products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."egat_scraping_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_matches" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "product_matches_select_all" ON "public"."product_matches" FOR SELECT USING (true);



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_insert_own" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "profiles_select_own" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "profiles_update_own" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "public_insert_access" ON "public"."egat_products" FOR INSERT WITH CHECK (true);



CREATE POLICY "public_logs_insert" ON "public"."egat_scraping_logs" FOR INSERT WITH CHECK (true);



CREATE POLICY "service_role_full_access" ON "public"."egat_products" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_logs_access" ON "public"."egat_scraping_logs" TO "service_role" USING (true) WITH CHECK (true);



ALTER TABLE "public"."shopee_products" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "shopee_products_select_all" ON "public"."shopee_products" FOR SELECT USING (true);





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."calculate_data_quality_score"() TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_data_quality_score"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_data_quality_score"() TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_match_confidence"("egat_brand" "text", "egat_model" "text", "shopee_name" "text", "shopee_brand" "text", "shopee_model" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_match_confidence"("egat_brand" "text", "egat_model" "text", "shopee_name" "text", "shopee_brand" "text", "shopee_model" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_match_confidence"("egat_brand" "text", "egat_model" "text", "shopee_name" "text", "shopee_brand" "text", "shopee_model" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."clean_egat_product_data"("product_data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."clean_egat_product_data"("product_data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."clean_egat_product_data"("product_data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_old_egat_products"("days_old" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_old_egat_products"("days_old" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_old_egat_products"("days_old" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_egat_scraping_stats"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_egat_scraping_stats"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_egat_scraping_stats"() TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."log_scraping_activity"("session_id" "uuid", "category_name" character varying, "status_name" character varying, "products_scraped_count" integer, "products_saved_count" integer, "error_msg" "text", "duration_sec" integer, "metadata_json" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."log_scraping_activity"("session_id" "uuid", "category_name" character varying, "status_name" character varying, "products_scraped_count" integer, "products_saved_count" integer, "error_msg" "text", "duration_sec" integer, "metadata_json" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_scraping_activity"("session_id" "uuid", "category_name" character varying, "status_name" character varying, "products_scraped_count" integer, "products_saved_count" integer, "error_msg" "text", "duration_sec" integer, "metadata_json" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."safe_insert_egat_products"("products_json" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."safe_insert_egat_products"("products_json" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."safe_insert_egat_products"("products_json" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."search_egat_products"("search_query" "text", "category_filter" character varying, "efficiency_filter" character varying, "limit_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."search_egat_products"("search_query" "text", "category_filter" character varying, "efficiency_filter" character varying, "limit_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_egat_products"("search_query" "text", "category_filter" character varying, "efficiency_filter" character varying, "limit_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "postgres";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "anon";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "service_role";



GRANT ALL ON FUNCTION "public"."show_limit"() TO "postgres";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "anon";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "service_role";



GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_match_confidence"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_match_confidence"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_match_confidence"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_search_vector"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_search_vector"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_search_vector"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_egat_product_data"("product_data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."validate_egat_product_data"("product_data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_egat_product_data"("product_data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."verify_migration_setup"() TO "anon";
GRANT ALL ON FUNCTION "public"."verify_migration_setup"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."verify_migration_setup"() TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "service_role";


















GRANT ALL ON TABLE "public"."egat_products" TO "anon";
GRANT ALL ON TABLE "public"."egat_products" TO "authenticated";
GRANT ALL ON TABLE "public"."egat_products" TO "service_role";



GRANT ALL ON TABLE "public"."egat_brand_stats" TO "anon";
GRANT ALL ON TABLE "public"."egat_brand_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."egat_brand_stats" TO "service_role";



GRANT ALL ON TABLE "public"."egat_category_stats" TO "anon";
GRANT ALL ON TABLE "public"."egat_category_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."egat_category_stats" TO "service_role";



GRANT ALL ON TABLE "public"."egat_daily_scraping_summary" TO "anon";
GRANT ALL ON TABLE "public"."egat_daily_scraping_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."egat_daily_scraping_summary" TO "service_role";



GRANT ALL ON SEQUENCE "public"."egat_products_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."egat_products_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."egat_products_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."egat_scraping_logs" TO "anon";
GRANT ALL ON TABLE "public"."egat_scraping_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."egat_scraping_logs" TO "service_role";



GRANT ALL ON SEQUENCE "public"."egat_scraping_logs_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."egat_scraping_logs_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."egat_scraping_logs_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."product_matches" TO "anon";
GRANT ALL ON TABLE "public"."product_matches" TO "authenticated";
GRANT ALL ON TABLE "public"."product_matches" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."shopee_products" TO "anon";
GRANT ALL ON TABLE "public"."shopee_products" TO "authenticated";
GRANT ALL ON TABLE "public"."shopee_products" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































RESET ALL;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();

CREATE TRIGGER objects_delete_delete_prefix AFTER DELETE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();

CREATE TRIGGER objects_insert_create_prefix BEFORE INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.objects_insert_prefix_trigger();

CREATE TRIGGER objects_update_create_prefix BEFORE UPDATE ON storage.objects FOR EACH ROW WHEN (((new.name <> old.name) OR (new.bucket_id <> old.bucket_id))) EXECUTE FUNCTION storage.objects_update_prefix_trigger();

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();

CREATE TRIGGER prefixes_create_hierarchy BEFORE INSERT ON storage.prefixes FOR EACH ROW WHEN ((pg_trigger_depth() < 1)) EXECUTE FUNCTION storage.prefixes_insert_trigger();

CREATE TRIGGER prefixes_delete_hierarchy AFTER DELETE ON storage.prefixes FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


