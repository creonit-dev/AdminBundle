<?php

namespace Creonit\AdminBundle\Component\Field;

use Creonit\MediaBundle\Model\Gallery;


class GalleryField extends Field
{
    const TYPE = 'gallery';

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