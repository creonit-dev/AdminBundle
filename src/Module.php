<?php

namespace Creonit\AdminBundle;

use Creonit\AdminBundle\Component\Component;
use Creonit\AdminBundle\Exception\ConfigurationException;

abstract class Module
{

    /** @var Component[] */
    protected $components = [];
    
    /** @var  Manager */
    protected $manager;

    protected $active;

    abstract public function initialize();

    public function getTitle(){
        return 'Untitled';
    }

    public function getIcon(){
        return 'fa fa-sticky-note-o';
    }

    public function getName(){
        if(preg_match('/\\\\(\w+)Module$/', get_class($this), $keyMatch)){
            return $keyMatch[1];

        }else{
            throw new ConfigurationException(sprintf('Invalid module name %s', get_class($this)));
        }
    }

    public function getUri(){
        return lcfirst($this->getName());
    }

    public function addComponent(Component $component){
        $this->components[$component->getName()] = $component->setModule($this)->setManager($this->manager);
        return $this;
    }
    
    public function getComponent($name){
        return $this->components[$name];
    }
    
    public function hasComponent($name){
        return isset($this->components[$name]);
    }

    public function includeSchema(){
        return '';
    }

    public function getTemplate(){}

    /**
     * @param Manager $manager
     * @return Module
     */
    public function setManager($manager)
    {
        $this->manager = $manager;
        return $this;
    }

    public function setActive($value = true)
    {
        $this->active = $value;
    }

    public function isActive(){
        return true === $this->active;
    }

}