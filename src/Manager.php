<?php

namespace Creonit\AdminBundle;

use Creonit\AdminBundle\Component\Request\ComponentRequest;
use Creonit\AdminBundle\Component\Response\ComponentResponse;
use Creonit\AdminBundle\Component\Storage\Storage;
use Creonit\AdminBundle\Exception\RequestException;
use Symfony\Bundle\TwigBundle\TwigEngine;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class Manager {

    /** @var Module[] $modules  */
    protected $modules = [];

    /** @var ContainerInterface */
    protected $container;

    /** @var TwigEngine */
    protected $templating;

    /** @var Module */
    protected $activeModule;

    public function __construct(ContainerInterface $container, TwigEngine $templating)
    {
        $this->container = $container;
        $this->templating = $templating;
    }

    public function hasModule($moduleName){
        return array_key_exists($moduleName, $this->modules);
    }

    public function getModule($moduleName){
        return $this->modules[$moduleName];
    }

    public function addModule(Module $module){
        $this->modules[$module->getName()] = $module;
        $module->setManager($this);
    }

    /**
     * @return Module
     */
    public function getActiveModule(){
        return $this->activeModule;
    }

    /**
     * @param Module $module
     * @return $this
     */
    public function setActiveModule(Module $module){
        $this->activeModule = $module;
        $module->setActive(true);
        return $this;
    }

    /**
     * @return Module[]
     */
    public function getModules(){
        return $this->modules;
    }

    public function handleRequest(Request $request){
        $componentRequests = array_merge_recursive($request->request->all(), $request->files->all())['request'];
        $componentResponses = [];

        if(!$componentRequests || !is_array($componentRequests)) {
            throw new RequestException('Bad request');
        }

        foreach ($componentRequests as $id => $componentRequest) {
            try {
                if(empty($componentRequest['name']) || !preg_match('/^(\w+)\.(\w+)$/', $componentRequest['name'], $componentMatch)){
                    throw new RequestException(sprintf('Wrong component name format "%s"', isset($componentRequest['name']) ? $componentRequest['name'] : ''));
                }

                if(!$this->hasModule($componentMatch[1])){
                    throw new RequestException(sprintf('Module "%s" not found', $componentMatch[1]));
                }

                $module = $this->getModule($componentMatch[1]);
                $module->initialize();

                if(!$module->hasComponent($componentMatch[2])){
                    throw new RequestException(sprintf('Component "%s" in module "%s" not found', $componentMatch[2], $componentMatch[1]));
                }

                $component = $module->getComponent($componentMatch[2]);
                $component->initialize();
                $componentResponses[] = $component->handleRequest(new ComponentRequest($componentRequest))->dump();

            }catch(RequestException $e){
                $componentResponse = new ComponentResponse();
                $componentResponse->error($e->getMessage());
                $componentResponses[] = $componentResponse->dump();
            }
        }

        return new JsonResponse($componentResponses);

    }

    /**
     * @return TwigEngine
     */
    public function getTemplating()
    {
        return $this->templating;
    }

    /**
     * @param string $storage
     * @return Storage
     */
    public function getStorage($storage = 'default'){
        return $this->container->get('creonit_admin.component.storage.' . $storage);
    }

} 