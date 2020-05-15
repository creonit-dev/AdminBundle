<?php


namespace Creonit\AdminBundle\Component\Event;


use Creonit\AdminBundle\Component\Component;
use Creonit\AdminBundle\Module;

class BuildComponentSchemaEvent
{
    /**
     * @var Module
     */
    protected $module;
    /**
     * @var Component
     */
    protected $component;

    public function __construct(Module $module, Component $component)
    {

        $this->module = $module;
        $this->component = $component;
    }

    /**
     * @return Module
     */
    public function getModule(): Module
    {
        return $this->module;
    }

    /**
     * @return Component
     */
    public function getComponent(): Component
    {
        return $this->component;
    }
}