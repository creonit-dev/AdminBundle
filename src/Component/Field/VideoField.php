<?php

namespace Creonit\AdminBundle\Component\Field;

use Creonit\MediaBundle\Model\Video;
use Creonit\MediaBundle\Model\VideoQuery;
use Symfony\Component\Validator\Constraints\Regex;

class VideoField extends Field
{
    const TYPE = 'video';

    public function validate($data)
    {

        $violations = parent::validate($data);
        if($violations && $violations->count()){
            return $violations;
        }

        return $this->container->get('validator')
            ->validate($data, new Regex([
                'pattern' => '#^(https?://)?(www\.)?(youtu\.be|youtube\.com)/(watch\?v=[\w\d_-]+|[\w\d_-]+)$#i',
                'message' => 'Неверный формат ссылки. Разрешены ссылки только на YouTube.'
            ]));
    }

    public function save($entity, $data, $processed = false)
    {
        if(!$data instanceof NoData){
            if($data){
                $videoId = parent::load($entity);
                if(!$videoId or ($video = VideoQuery::create()->findPk($videoId) and $data != $video->getUrl())){
                    $video = new Video;
                    $video->setUrl($data);
                    $video->save();
                    $videoId = $video->getId();
                }

            }else{
                if($videoId = parent::load($entity) and $video = VideoQuery::create()->findPk($videoId)) {
                    $video->delete();
                }
                $videoId = null;
            }

            parent::save($entity, $videoId);
        }
    }


    public function load($entity)
    {
        if($value = parent::load($entity)){
            $video = VideoQuery::create()->findPk($value);

            return $this->decorate([
                'url' => $video->getUrl(),
                'preview' => $video->getPreviewTag(100),
                'code' => $video->getCode(300),
            ]);

        }else{
            return $value;
        }
    }


}