<?php

namespace Creonit\AdminBundle\Component;

use Creonit\AdminBundle\Component\Event\AfterComponentHandleEvent;
use Creonit\AdminBundle\Component\Event\BeforeComponentHandleEvent;
use Creonit\AdminBundle\Component\Event\BuildComponentSchemaEvent;
use Creonit\AdminBundle\Component\Request\ComponentRequest;
use Creonit\AdminBundle\Component\Response\ComponentResponse;
use Creonit\AdminBundle\Component\Scope\Scope;
use Creonit\AdminBundle\Exception\ConfigurationException;
use Creonit\AdminBundle\Exception\HandleException;
use Creonit\AdminBundle\Module;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\PropertyAccess\PropertyAccess;

abstract class Component extends Scope
{
    /** @var  ContainerInterface */
    protected $container;

    /** @var  Module */
    protected $module;

    protected $initialized = false;

    protected $title = '';
    protected $actions = [];
    protected $events = [];
    protected $reloadSchema = false;


    /** @var callable[] */
    protected $handlers = [];

    public function getName()
    {
        if (preg_match('/\\\\(\w+)$/', get_class($this), $keyMatch)) {
            return $keyMatch[1];

        } else {
            throw new ConfigurationException(sprintf('Invalid module name %s', get_class($this)));
        }
    }


    public function initialize()
    {
        if (true === $this->initialized) {
            return;
        }

        $eventDispatcher = $this->container->get('event_dispatcher');

        if (null !== $schema = $this->parseSchemaAnnotations()) {
            $this->applySchemaAnnotations($schema['__']);
        }
        $this->prepareSchema();
        $this->schema();

        $eventDispatcher->dispatch(new BuildComponentSchemaEvent($this->module, $this));

        $this->prepareTemplate();
        $this->initialized = true;
    }

    /**
     * @param ComponentRequest $request
     * @return ComponentResponse
     */
    public function handleRequest(ComponentRequest $request)
    {
        $response = new ComponentResponse();

        try {
            if ($request->getType() == ComponentRequest::TYPE_LOAD_SCHEMA) {
                $response->setSchema($this->dump());
                $this->loadData($request, $response);

            } else if ($request->getType() == ComponentRequest::TYPE_LOAD_DATA) {
                $this->loadData($request, $response);

            } else {
                $this->handle($request->getType(), $request, $response);
            }

        } catch (HandleException $e) {

        }

        return $response;
    }

    public function handle($handlerName, ComponentRequest $request, ComponentResponse $response)
    {
        $eventDispatcher = $this->container->get('event_dispatcher');

        $handler = array_key_exists($handlerName, $this->handlers) ? $this->handlers[$handlerName] : null;

        $beforeEvent = new BeforeComponentHandleEvent($this->module, $this, $request, $response, $handlerName, $handler);
        $eventDispatcher->dispatch($beforeEvent);

        $handler = $beforeEvent->getHandler();

        if (!$handler or !is_callable($handler)) {
            $response->flushError(sprintf('Обработчик %s не найден', $handlerName));
        }

        try {
            $handler($request, $response);

        } finally {
            $eventDispatcher->dispatch(
                new AfterComponentHandleEvent($this->module, $this, $request, $response, $handlerName, $handler)
            );
        }
    }

    /**
     * @param $handler
     * @param callable $callable
     * @return Component
     */
    public function setHandler($handler, callable $callable)
    {
        return $this->addHandler($handler, $callable);
    }

    /**
     * @param $handler
     * @param callable $callable
     * @return $this
     */
    public function addHandler($handler, callable $callable)
    {
        $this->handlers[$handler] = $callable;
        return $this;
    }

    public function removeHandler($handler)
    {
        if ($this->hasHandler($handler)) {
            unset($this->handlers[$handler]);
        }
        return $this;
    }

    public function hasHandler($handler)
    {
        return isset($this->handlers[$handler]);
    }

    /**
     * @param bool $value
     */
    public function setReloadSchema($value)
    {
        $this->reloadSchema = $value;
    }

    public function parseSchemaAnnotations()
    {
        return $this->parseClassSchemaAnnotations($this);
    }

    public function parseClassSchemaAnnotations($class)
    {
        if (!$docComment = (new \ReflectionClass($class))->getMethod('schema')->getDocComment()) {
            return null;
        }

        $docComment = preg_replace('#^[ \t]*/?\*+ */?#m', '', $docComment);
        $lines = preg_split('#[\n\r]+#', $docComment);
        $cursorEntity = null;

        $schema = [];
        $scope = [];
        $scopeName = '\\';
        $parameter = null;

        foreach ($lines as $line) {
            if (!$line = trim($line)) continue;

            if (preg_match('#^((?:\\\\\w*)+) *$#', $line, $match)) {
                if ($parameter && $parameter['key'] != '#') {
                    $scope[] = $parameter;
                    $parameter = null;
                }

                $schema[$scopeName] = $scope;
                $scope = [];
                $scopeName = $match[1] ?: 'root';

            } else if (preg_match('#^(\#?)\@(\w+)\s*(.*)$#', $line, $match)) {
                if ($parameter && $parameter['key'] != '#') {
                    $scope[] = $parameter;
                }

                $parameter = ['key' => $match[1] ?: $match[2], 'value' => $match[3]];

            } else {
                if ($parameter) {
                    $parameter['value'] .= "\n" . $line;
                }
            }
        }

        if ($parameter && $parameter['key'] != '#') {
            $scope[] = $parameter;
        }
        $schema[$scopeName] = $scope;

        $accessor = PropertyAccess::createPropertyAccessor();

        $result = [];

        foreach ($schema as $path => $parameters) {
            $path = preg_replace('/^\\\\$/', '[\]', $path);
            $path = preg_replace('/^\\\\/', '[\]\\', $path);
            $path = preg_replace('/\\\\([\w_-]+)/', '[scopes][$1]', $path);
            $path = str_replace('\\', '__', $path);
            $accessor->setValue($result, $path . '[parameters]', $parameters);
        }

        return $result;
    }

    public function applySchemaAnnotation($annotation)
    {
        switch ($annotation['key']) {
            case 'reloadSchema':
                $this->setReloadSchema($annotation['key']);
                break;
            case 'action':
                if (preg_match('/^([\w_-]+)\s*?(\(.*?\)\s*\{.*\}\s*)$/usi', $annotation['value'], $match)) {
                    $this->setAction($match[1], 'function' . $match[2]);
                }
                break;
            case 'event':
                if (preg_match('/^([\w_-]+)\s*?(\(.*?\)\s*\{.*\}\s*)$/usi', $annotation['value'], $match)) {
                    $this->setEvent($match[1], 'function' . $match[2]);
                }
                break;
            case 'title':
                $this->setTitle($annotation['value']);
                break;
            default:
                parent::applySchemaAnnotation($annotation);
        }
    }

    abstract public function schema();

    protected function prepareSchema()
    {
    }


    public function setTitle($title)
    {
        $this->title = $title;
        return $this;
    }

    public function getTitle()
    {
        return $this->title;
    }

    /**
     * @param Module $module
     * @return Component
     */
    public function setModule($module)
    {
        $this->module = $module;
        return $this;
    }

    public function setEvent($name, $script)
    {
        $this->events[$name] = $script;
        return $this;
    }

    public function setAction($name, $script)
    {
        $this->actions[$name] = $script;
        return $this;
    }

    protected function loadData(ComponentRequest $request, ComponentResponse $response)
    {
    }

    public function dump()
    {
        return array_merge(parent::dump(), [
            'title' => $this->title,
            'actions' => $this->actions,
            'events' => $this->events,
            'reloadSchema' => (bool)$this->reloadSchema,
        ]);
    }
}