<?php

namespace app\models\opinion;

use app\core\Application;
use app\core\DBModel;
use app\models\offer\Offer;
use app\models\offer\OfferPhoto;

class Opinion extends DBModel
{
    public int $id = 0;
    public float $rating = 0;
    public string $title = "";
    public string $comment = "";
    public string $visit_date = "";
    public string $visit_context = "";

    public bool $read = false;
    public bool $blacklisted = false;

    public int $account_id;
    public int $offer_id;

    public string $created_at = "";
    public string $updated_at = "";

    public bool $blacklistage_possible = true;

    public int $nb_reports = 0;
    public static function tableName(): string
    {
        return 'opinion';
    }

    public function attributes(): array
    {
        return ['rating', 'title', 'comment', 'visit_date', 'visit_context', 'read', 'blacklisted', 'account_id', 'offer_id', 'nb_reports', 'blacklistage_possible'];
    }

    public function rules(): array
    {
        return [
            'rating' => [self::RULE_REQUIRED],
            'title' => [self::RULE_REQUIRED, [self::RULE_MAX, 'max' => 128]],
            'comment' => [self::RULE_REQUIRED, [self::RULE_MAX, 'max' => 1024]],
            'visit_date' => [self::RULE_REQUIRED],
            'visit_context' => [self::RULE_REQUIRED],
        ];
    }

    public function labels(): array
    {
        return [
            'rating' => 'Quelle note donneriez-vous à votre expérience ?',
            'title' => 'Donnez un titre à votre avis',
            'comment' => 'Ajoutez votre commentaire',
            'visit_date' => 'Quand y êtes-vous allé ?',
            'visit_context' => 'Qui vous accompagnait ?',
        ];
    }

    public function addPhoto(string $photo_url)
    {
        $photo = new OpinionPhoto();
        $photo->photo_url = $photo_url;
        $photo->opinion_id = $this->id;
        $photo->save();
    }

    public function addLike()
    {
        $like = new OpinionLike();
        $like->opinion_id = $this->id;
        $like->account_id = Application::$app->user->account_id;
        $like->save();
    }

    public function removeLike()
    {
        $like = OpinionLike::findOne(["opinion_id" => $this->id, "account_id" => Application::$app->user->account_id]);
        $like->destroy();
    }

    public function addDislike()
    {
        $dislike = new OpinionDislike();
        $dislike->opinion_id = $this->id;
        $dislike->account_id = Application::$app->user->account_id;
        $dislike->save();
    }

    public function removeDislike()
    {
        $dislike = OpinionDislike::findOne(["opinion_id" => $this->id, "account_id" => Application::$app->user->account_id]);
        $dislike->destroy();
    }

    public function likes(): int
    {
        // Use SQL COUNT for better performance
        $statement = self::prepare("SELECT COUNT(*) as count FROM " . OpinionLike::tableName() . " WHERE opinion_id = :opinion_id");
        $statement->bindValue(':opinion_id', $this->id);
        $statement->execute();
        $result = $statement->fetch(\PDO::FETCH_ASSOC);
        return (int)($result['count'] ?? 0);
    }

    public function dislikes(): int
    {
        // Use SQL COUNT for better performance
        $statement = self::prepare("SELECT COUNT(*) as count FROM " . OpinionDislike::tableName() . " WHERE opinion_id = :opinion_id");
        $statement->bindValue(':opinion_id', $this->id);
        $statement->execute();
        $result = $statement->fetch(\PDO::FETCH_ASSOC);
        return (int)($result['count'] ?? 0);
    }


    public function addReport()
    {
        $this->nb_reports += 1;
        $this->update();
    }

    public function photos()
    {
        return OpinionPhoto::find(['opinion_id' => $this->id]);
    }


    public function getOffer(){
        return Offer::findOne($this->offer_id);
    }

    public function updateTimeNewToken() : bool
    {
        $opinion_blacklisted = OpinionBlackList::findOne(['opinion_id' => $this->id]);
        if (!$opinion_blacklisted || empty($opinion_blacklisted->created_at)) {
            return false;
        }

        $offer = Offer::findOneByPk($this->offer_id);
        if (!$offer) {
            return false;
        }

        $timeElapsed = time() - strtotime($opinion_blacklisted->created_at);
        $timeRemaining = 300 - $timeElapsed;

        if ($timeRemaining < 0) {
            return false;
        }

        $offer->time_new_token = $timeElapsed;
        return $offer->update();
    }
}