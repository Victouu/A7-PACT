<?php

use app\core\Application;

class m0024_add_performance_indexes
{
    public function up()
    {
        $db = Application::$app->db;
        $sql = "
        -- Add indexes for frequently queried foreign keys in offer table
        CREATE INDEX IF NOT EXISTS idx_offer_professional_id ON offer(professional_id);
        CREATE INDEX IF NOT EXISTS idx_offer_address_id ON offer(address_id);
        CREATE INDEX IF NOT EXISTS idx_offer_offer_type_id ON offer(offer_type_id);
        CREATE INDEX IF NOT EXISTS idx_offer_category ON offer(category);
        CREATE INDEX IF NOT EXISTS idx_offer_offline ON offer(offline);
        CREATE INDEX IF NOT EXISTS idx_offer_rating ON offer(rating);
        CREATE INDEX IF NOT EXISTS idx_offer_minimum_price ON offer(minimum_price);
        
        -- Add indexes for opinion queries
        CREATE INDEX IF NOT EXISTS idx_opinion_offer_id ON opinion(offer_id);
        CREATE INDEX IF NOT EXISTS idx_opinion_account_id ON opinion(account_id);
        CREATE INDEX IF NOT EXISTS idx_opinion_read ON opinion(read);
        CREATE INDEX IF NOT EXISTS idx_opinion_blacklisted ON opinion(blacklisted);
        
        -- Add indexes for subscription queries
        CREATE INDEX IF NOT EXISTS idx_subscription_offer_id ON subscription(offer_id);
        CREATE INDEX IF NOT EXISTS idx_subscription_option_id ON subscription(option_id);
        CREATE INDEX IF NOT EXISTS idx_subscription_launch_date ON subscription(launch_date);
        
        -- Add indexes for offer associations
        CREATE INDEX IF NOT EXISTS idx_offer_photo_offer_id ON offer_photo(offer_id);
        CREATE INDEX IF NOT EXISTS idx_offer_is_tagged_offer_id ON offer_is_tagged(offer_id);
        CREATE INDEX IF NOT EXISTS idx_offer_is_tagged_tag_id ON offer_is_tagged(tag_id);
        CREATE INDEX IF NOT EXISTS idx_link_schedule_offer_id ON link_schedule(offer_id);
        CREATE INDEX IF NOT EXISTS idx_link_schedule_schedule_id ON link_schedule(schedule_id);
        
        -- Add indexes for offer status history
        CREATE INDEX IF NOT EXISTS idx_offer_status_history_offer_id ON offer_status_history(offer_id);
        CREATE INDEX IF NOT EXISTS idx_offer_status_history_created_at ON offer_status_history(created_at);
        
        -- Add indexes for message queries
        CREATE INDEX IF NOT EXISTS idx_message_sender_id ON message(sender_id);
        CREATE INDEX IF NOT EXISTS idx_message_receiver_id ON message(receiver_id);
        CREATE INDEX IF NOT EXISTS idx_message_deleted ON message(deleted);
        CREATE INDEX IF NOT EXISTS idx_message_sended_date ON message(sended_date);
        
        -- Add indexes for notification queries
        CREATE INDEX IF NOT EXISTS idx_notification_user_id ON notification(user_id);
        
        -- Add composite index for address geolocation queries
        CREATE INDEX IF NOT EXISTS idx_address_latitude_longitude ON address(latitude, longitude);
        CREATE INDEX IF NOT EXISTS idx_address_city ON address(city);
        ";
        $db->pdo->exec($sql);
    }

    public function down()
    {
        $db = Application::$app->db;
        $sql = "
        DROP INDEX IF EXISTS idx_offer_professional_id;
        DROP INDEX IF EXISTS idx_offer_address_id;
        DROP INDEX IF EXISTS idx_offer_offer_type_id;
        DROP INDEX IF EXISTS idx_offer_category;
        DROP INDEX IF EXISTS idx_offer_offline;
        DROP INDEX IF EXISTS idx_offer_rating;
        DROP INDEX IF EXISTS idx_offer_minimum_price;
        
        DROP INDEX IF EXISTS idx_opinion_offer_id;
        DROP INDEX IF EXISTS idx_opinion_account_id;
        DROP INDEX IF EXISTS idx_opinion_read;
        DROP INDEX IF EXISTS idx_opinion_blacklisted;
        
        DROP INDEX IF EXISTS idx_subscription_offer_id;
        DROP INDEX IF EXISTS idx_subscription_option_id;
        DROP INDEX IF EXISTS idx_subscription_launch_date;
        
        DROP INDEX IF EXISTS idx_offer_photo_offer_id;
        DROP INDEX IF EXISTS idx_offer_is_tagged_offer_id;
        DROP INDEX IF EXISTS idx_offer_is_tagged_tag_id;
        DROP INDEX IF EXISTS idx_link_schedule_offer_id;
        DROP INDEX IF EXISTS idx_link_schedule_schedule_id;
        
        DROP INDEX IF EXISTS idx_offer_status_history_offer_id;
        DROP INDEX IF EXISTS idx_offer_status_history_created_at;
        
        DROP INDEX IF EXISTS idx_message_sender_id;
        DROP INDEX IF EXISTS idx_message_receiver_id;
        DROP INDEX IF EXISTS idx_message_deleted;
        DROP INDEX IF EXISTS idx_message_sended_date;
        
        DROP INDEX IF EXISTS idx_notification_user_id;
        
        DROP INDEX IF EXISTS idx_address_latitude_longitude;
        DROP INDEX IF EXISTS idx_address_city;
        ";
        $db->pdo->exec($sql);
    }
}
