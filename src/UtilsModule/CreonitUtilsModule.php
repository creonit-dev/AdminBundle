<?php

namespace Creonit\AdminBundle\UtilsModule;

use Creonit\AdminBundle\Module;

class CreonitUtilsModule extends Module
{

    protected $visible = false;

    public function initialize()
    {
        $this->addComponent(new GalleryTable);
        $this->addComponent(new GalleryImageEditor());
        $this->addComponent(new GalleryVideoEditor());
    }


}