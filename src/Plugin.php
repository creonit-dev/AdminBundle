<?php

namespace Creonit\AdminBundle;

abstract class Plugin
{

    protected $javascripts = [];
    protected $stylesheets = [];


    abstract public function configure();

    /**
     * @return array
     */
    public function getJavascripts()
    {
        return $this->javascripts;
    }

    /**
     * @return array
     */
    public function getStylesheets()
    {
        return $this->stylesheets;
    }

    protected function addStylesheet($src){
        $this->stylesheets[] = $src;
    }

    protected function addJavascript($src){
        $this->javascripts[] = $src;
    }


}