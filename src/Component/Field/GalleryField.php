<?php

namespace Creonit\AdminBundle\Component\Field;

use AppBundle\Model\Gallery;
use Creonit\AdminBundle\Component\Storage\Storage;

class GalleryField extends Field
{

    public function load($entity)
    {
        if($data = parent::load($entity)){
            return $data;
        }else{
            $gallery = new Gallery();
            $gallery->save();
            return $gallery->getId();
        }
    }

}