<?php

namespace Creonit\AdminBundle;

use Creonit\AdminBundle\Component\Component;
use Creonit\AdminBundle\Exception\ConfigurationException;
use Symfony\Component\DependencyInjection\ContainerInterface;

abstract class Module
{

    /** @var Component[] */
    protected $components = [];
    
    /** @var  Manager */
    protected $manager;

    protected $active;

    /** @var  ContainerInterface */
    protected $container;

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
        $this->components[$component->getName()] = $component->setModule($this)->setContainer($this->container);
        return $this;
    }
    
    public function getComponent($name){
        return $this->components[$name];
    }
    
    public function hasComponent($name){
        return isset($this->components[$name]);
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

    /**
     * @param ContainerInterface $container
     * @return $this
     */
    public function setContainer(ContainerInterface $container)
    {
        $this->container = $container;
        return $this;
    }

    /**
     * @param bool $value
     * @return $this
     */
    public function setActive($value = true)
    {
        $this->active = $value;
        return $this;
    }

    public function isActive(){
        return true === $this->active;
    }


}