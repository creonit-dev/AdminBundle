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

    protected $icon;
    protected $title;
    protected $template;
    protected $name;

    protected $visible = true;
    /** @var  ContainerInterface */
    protected $container;


    public function __construct(){
        $this->configure();
    }

    protected function configure(){
    }

    abstract public function initialize();

    public function getTitle(){
        return $this->title;
    }

    public function getIcon(){
        return $this->icon;
    }

    public function getName(){
        if($this->name){
            return $this->name;

        }else if(preg_match('/\\\\(\w+)Module$/', get_class($this), $keyMatch)){
            return $keyMatch[1];

        }else{
            throw new ConfigurationException(sprintf('Invalid module name %s', get_class($this)));
        }
    }
    
    public function setName($name){
        $this->name = $name;
        return $this;
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

    public function getTemplate(){
        return $this->template;
    }

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

    /**
     * @return boolean
     */
    public function isVisible()
    {
        return $this->visible;
    }

    /**
     * @param boolean $visible
     * @return Module
     */
    public function setVisible($visible)
    {
        $this->visible = $visible;
        return $this;
    }

    /**
     * @param mixed $icon
     * @return Module
     */
    public function setIcon($icon)
    {
        $this->icon = $icon;
        return $this;
    }

    /**
     * @param mixed $title
     * @return Module
     */
    public function setTitle($title)
    {
        $this->title = $title;
        return $this;
    }

    /**
     * @param mixed $template
     * @return Module
     */
    public function setTemplate($template)
    {
        $this->template = $template;
        return $this;
    }


}