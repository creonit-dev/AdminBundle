<?php

namespace Creonit\AdminBundle\Component\Field;

use AppBundle\Model\Video;
use AppBundle\Model\VideoQuery;
use Symfony\Component\Validator\Constraints\Regex;

class VideoField extends Field
{
    public function validate1($data)
    {

        $violations = parent::validate($data);
        if($violations->count()){
            return $violations;
        }

        return $this->container->get('validator')->validate(new Regex('#^(https?://)?(www\.)?(youtu\.be|youtube\.com)/(watch\?v=[\w\d_-]+|[\w\d_-]+)$#i', ['message' => 'Неверный формат ссылки. Разрешены ссылки только на YouTube.']));

        //if(!preg_match(, $request->data->get('url'))){
        //    $response->error('Неверный формат ссылки. Разрешены ссылки только на YouTube.', 'url');
        //}
        
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