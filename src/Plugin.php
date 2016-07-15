<?php

namespace Creonit\AdminBundle;

abstract class Plugin
{

    protected $javascripts = [];
    protected $stylesheets = [];
    protected $fieldTypes = [];
    protected $injections = [];



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

    /**
     * @return array
     */
    public function getFieldTypes()
    {
        return $this->fieldTypes;
    }

    /**
     * @return array
     */
    public function getInjections()
    {
        return $this->injections;
    }

    public function addInjection($block, $text){
        $this->injections[] = [$block, $text];
    }

    protected function addStylesheet($src){
        $this->stylesheets[] = $src;
    }

    protected function addJavascript($src){
        $this->javascripts[] = $src;
    }
    
    protected function addFieldType($className){
        $this->fieldTypes[] = $className;
    }


}