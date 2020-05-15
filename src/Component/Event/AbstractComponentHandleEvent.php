<?php


namespace Creonit\AdminBundle\Component\Event;


use Creonit\AdminBundle\Component\Component;
use Creonit\AdminBundle\Component\Request\ComponentRequest;
use Creonit\AdminBundle\Component\Response\ComponentResponse;
use Creonit\AdminBundle\Module;
use Symfony\Contracts\EventDispatcher\Event;

abstract class AbstractComponentHandleEvent extends Event
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
     * @var callable
     */
    protected $handler;

    /**
     * @var string
     */
    protected $handlerName;

    /**
     * @var ComponentRequest
     */
    protected $request;

    /**
     * @var ComponentResponse
     */
    protected $response;

    public function __construct(Module $module, Component $component, ComponentRequest $request, ComponentResponse $response, $handlerName, $handler)
    {
        $this->module = $module;
        $this->component = $component;
        $this->request = $request;
        $this->response = $response;
        $this->handlerName = $handlerName;
        $this->handler = $handler;
    }

    /**
     * @return Module
     */
    public function getModule()
    {
        return $this->module;
    }

    /**
     * @return Component
     */
    public function getComponent()
    {
        return $this->component;
    }

    /**
     * @return callable|null
     */
    public function getHandler()
    {
        return $this->handler;
    }

    /**
     * @param callable|null $handler
     */
    public function setHandler($handler)
    {
        $this->handler = $handler;
    }

    /**
     * @return string
     */
    public function getHandlerName()
    {
        return $this->handlerName;
    }

    /**
     * @return ComponentRequest
     */
    public function getRequest()
    {
        return $this->request;
    }

    /**
     * @return ComponentResponse
     */
    public function getResponse()
    {
        return $this->response;
    }
}