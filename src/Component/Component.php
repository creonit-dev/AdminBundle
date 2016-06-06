<?php

namespace Creonit\AdminBundle\Component;

use Creonit\AdminBundle\Component\Pattern\Pattern;
use Creonit\AdminBundle\Component\Request\ComponentRequest;
use Creonit\AdminBundle\Component\Response\ComponentResponse;
use Creonit\AdminBundle\Component\Response\PatternResponse;
use Creonit\AdminBundle\Exception\ConfigurationException;
use Creonit\AdminBundle\Module;
use Symfony\Component\DependencyInjection\ContainerInterface;

abstract class Component
{
    /** @var  ContainerInterface */
    protected $container;

    /** @var  Module */
    protected $module;

    protected $initialized = false;

    /** @var Pattern[] */
    protected $patterns = [];

    protected $template = '';
    protected $title = '';

    public function getName(){
        if(preg_match('/\\\\(\w+)$/', get_class($this), $keyMatch)){
            return $keyMatch[1];

        }else{
            throw new ConfigurationException(sprintf('Invalid module name %s', get_class($this)));
        }
    }

    public function getPattern($name){
        return $this->patterns[$name];
    }

    public function addPattern(Pattern $pattern){
        $this->patterns[$pattern->getName()] = $pattern->setComponent($this);
        return $this;
    }

    /**
     * @param $name
     * @return Pattern
     */
    abstract public function createPattern($name);


    public function initialize(){
        if(true === $this->initialized){
            return;
        }

        if(null !== $schema = $this->parseSchemaAnnotations()){
            $this->applySchemaAnnotations(array_shift($schema));

            foreach ($schema as $name => $pattern){
                $this->addPattern($this->createPattern($name)->applySchemaAnnotations($pattern));
            }

        }

        $this->prepareSchema();
        $this->schema();
        
        foreach($this->patterns as $pattern){
            $pattern->prepareTemplate();
        }

        $this->initialized = true;
    }

    /**
     * @param ComponentRequest $request
     * @return ComponentResponse
     */
    public function handleRequest(ComponentRequest $request){
        $response = new ComponentResponse();
        
        if($request->getType() == ComponentRequest::TYPE_LOAD_SCHEMA){
            $response->setSchema($this->dump());
        }

        foreach($this->patterns as $pattern){
            if($request->getType() == ComponentRequest::TYPE_SEND_DATA) {
                $pattern->setData($request, $response);
            }

            $pattern->getData($request, $response);
        }

        return $response;
    }


    public function parseSchemaAnnotations(){
        if(!$docComment = (new \ReflectionClass($this))->getMethod('schema')->getDocComment()){
            return null;
        }

        $docComment = preg_replace('#^ */?\*+ */?#m', '', $docComment);
        $lines = preg_split('#[\n\r]+#', $docComment);
        $cursorEntity = null;

        $schema = [];
        $pattern = [];
        $patternName = 'root';
        $parameter = null;

        foreach($lines as $line) {
            if (!$line = trim($line)) continue;

            if (preg_match('#^\\\\(\w+) *$#', $line, $match)) {
                if($parameter && $parameter['key'] != '#'){
                    $pattern[] = $parameter;
                    $parameter = null;
                }

                $schema[$patternName] = $pattern;
                $pattern = [];
                $patternName = $match[1];

            } else if (preg_match('#^(\#?)\@(\w+)\s*(.*)$#', $line, $match)) {
                if($parameter && $parameter['key'] != '#'){
                    $pattern[] = $parameter;
                }

                $parameter = ['key' => $match[1] ?: $match[2], 'value' => $match[3]];

            } else {
                if($parameter){
                    $parameter['value'] .= "\n" . $line;
                }
            }
        }

        if($parameter && $parameter['key'] != '#'){
            $pattern[] = $parameter;
        }
        $schema[$patternName] = $pattern;

        return $schema;
    }

    public function applySchemaAnnotations($annotations){
        foreach ($annotations as $annotation){
            $this->applySchemaAnnotation($annotation);
        }
    }

    public function applySchemaAnnotation($annotation){
        switch($annotation['key']){
            case 'title':
                $this->setTitle($annotation['value']);
                break;
            case 'template':
                $this->setTemplate($annotation['value']);
                break;
        }
    }

    public function dump(){
        $schema = [
            'template' => $this->template,
            'patterns' => []
        ];
        
        foreach ($this->patterns as $pattern){
            $schema['patterns'][] = $pattern->dump();
        }

        return $schema;
    }

    abstract public function schema();

    public function load(ComponentRequest $request, ComponentResponse $response){}

    public function send(ComponentRequest $request, ComponentResponse $response){}

    protected function prepareSchema(){}

    /**
     * @param string $template
     * @return Component
     */
    public function setTemplate($template)
    {
        $this->template = $template;
        return $this;
    }

    /**
     * @return string
     */
    public function getTemplate()
    {
        return $this->template;
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
     * @param Module $module
     * @return Component
     */
    public function setModule($module)
    {
        $this->module = $module;
        return $this;
    }

    /**
     * @param string $title
     * @return Component
     */
    public function setTitle($title)
    {
        $this->title = $title;
        return $this;
    }

    /**
     * @return string
     */
    public function getTitle()
    {
        return $this->title;
    }



}