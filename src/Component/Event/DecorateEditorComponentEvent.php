<?php


namespace Creonit\AdminBundle\Component\Event;


use Creonit\AdminBundle\Component\Component;
use Creonit\AdminBundle\Component\Request\ComponentRequest;
use Creonit\AdminBundle\Component\Response\ComponentResponse;
use Creonit\AdminBundle\Module;

class DecorateEditorComponentEvent
{
    /**
     * @var Module
     */
    protected $module;
    /**
     * @var Component
     */
    protected $component;
    /**
     * @var ComponentRequest
     */
    protected $request;
    /**
     * @var ComponentResponse
     */
    protected $response;

    protected $entity;

    public function __construct(Module $module, Component $component, ComponentRequest $request, ComponentResponse $response, $entity)
    {
        $this->module = $module;
        $this->component = $component;
        $this->request = $request;
        $this->response = $response;
        $this->entity = $entity;
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

    /**
     * @return ComponentRequest
     */
    public function getRequest(): ComponentRequest
    {
        return $this->request;
    }

    /**
     * @return ComponentResponse
     */
    public function getResponse(): ComponentResponse
    {
        return $this->response;
    }

    /**
     * @return mixed
     */
    public function getEntity()
    {
        return $this->entity;
    }
}