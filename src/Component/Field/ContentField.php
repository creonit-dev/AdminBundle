<?php

namespace Creonit\AdminBundle\Component\Field;

use Creonit\ContentBundle\Model\Content;

class ContentField extends Field
{
    protected $type = 'content';

    public function load($entity)
    {
        if($data = parent::load($entity)){
            return $data;
        }else{
            $content = new Content();
            $content->save();
            return $content->getId();
        }
    }

}