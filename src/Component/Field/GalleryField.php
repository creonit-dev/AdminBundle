<?php

namespace Creonit\AdminBundle\Component\Field;

use AppBundle\Model\Gallery;
use Creonit\AdminBundle\Component\Storage\Storage;

class GalleryField extends Field
{
    public function load(Storage $storage, $entity)
    {
        parent::load($storage, $entity);

        if(!$this->data){
            $gallery = new Gallery();
            $gallery->save();
            $this->data = $gallery->getId();
        }
    }


}