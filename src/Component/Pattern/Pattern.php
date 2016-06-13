<?php

namespace Creonit\AdminBundle\Component\Pattern;

use Creonit\AdminBundle\Component\Component;
use Creonit\AdminBundle\Component\Request\ComponentRequest;
use Creonit\AdminBundle\Component\Field\Field;
use Creonit\AdminBundle\Component\Response\ComponentResponse;
use Creonit\AdminBundle\Component\Storage\Storage;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\ExpressionLanguage\ExpressionLanguage;
use Symfony\Component\Validator\Constraints\Email;
use Symfony\Component\Validator\Constraints\File;
use Symfony\Component\Validator\Constraints\Image;
use Symfony\Component\Validator\Constraints\NotBlank;

abstract class Pattern
{

    protected $name;
    protected $entity;

    protected $storage;

    protected $template = '';
    
    /** @var ContainerInterface */
    protected $container;
    
    /** @var Component */
    protected $component;

    /** @var Pattern|null */
    protected $parentPattern;
    
    /** @var Field[] */
    protected $fields = [];


    public function __construct(ContainerInterface $container){
        $this->container = $container;
    }

    /**
     * @param Pattern|null $parentPattern
     */
    public function setParentPattern($parentPattern){
        $this->parentPattern = $parentPattern;
    }

    public function getName(){
        return $this->name;
    }

    public function setName($name){
        $this->name = $name;
    }

    public function addField(Field $field){
        $this->fields[$field->getName()] = $field->setPattern($this);
        return $this;
    }

    public function hasField($fieldName)
    {
        return array_key_exists($fieldName, $this->fields);
    }

    public function getTemplate()
    {
        return $this->template;
    }

    /**
     * @param mixed $template
     * @return Pattern
     */
    public function setTemplate($template)
    {
        $this->template = $template;
        return $this;
    }

    /**
     * @return Field[]
     */
    public function getFields()
    {
        return $this->fields;
    }

    public function getField($name){
        return $this->fields[$name];
    }


    public function dump(){
        $pattern = [
            'name' => $this->name,
            'template' => $this->template,
            'fields' => []
        ];

        foreach ($this->fields as $field){
            $pattern['fields'][] = $field->dump();
        }

        return $pattern;
    }


    public function applySchemaAnnotations($annotations){
        foreach ($annotations as $annotation){
            $this->applySchemaAnnotation($annotation);
        }
        return $this;
    }

    public function applySchemaAnnotation($annotation){
        switch($annotation['key']){
            case 'storage':
                $this->setStorage($annotation['value']);
                break;
            case 'field':
                if(preg_match('/^([\w_]+)(?:\:([\w_]+))?(?: *(\{.*\}))?$/usi', $annotation['value'], $match)){
                    $type = isset($match[2]) ? $match[2] : 'default';
                    $name = $match[1];
                    if(isset($match[3])){
                        $language = new ExpressionLanguage();
                        $language->register('NotBlank', function(){}, function ($options) {return new NotBlank($options);});
                        $language->register('Email', function(){}, function ($options) {return new Email($options);});
                        $language->register('Image', function(){}, function ($arguments, $options = []) {dump($options);return new Image($options);});
                        $language->register('File', function(){}, function ($options) {return new File($options);});




                        $options = $language->evaluate($match[3]);
                    }else{
                        $options = [];
                    }
                    $this->addField($this->createField($name, $options, $type));
                }
                break;
            case 'entity':
                $this->setEntity($annotation['value']);
                break;
            case 'template':
                $this->setTemplate($annotation['value']);
                break;
        }
        return $this;
    }

    abstract public function getData(ComponentRequest $request, ComponentResponse $response);


    public function setData(ComponentRequest $request, ComponentResponse $response){}

    /**
     * @param Component $component
     * @return Pattern
     */
    public function setComponent($component)
    {
        $this->component = $component;
        return $this;
    }

    /**
     * @param mixed $entity
     * @return Pattern
     */
    public function setEntity($entity)
    {
        $this->entity = $entity;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getEntity()
    {
        return $this->entity ?: $this->name;
    }

    public function prepareTemplate()
    {
        $createField = function ($match){
            if(!$this->hasField($match[1])){
                switch($match[2]){
                    case 'file':
                        $type = 'file';
                        break;
                    case 'image':
                        $type = 'image';
                        break;
                    case 'select':
                    case 'radio':
                        $type = 'select';
                        break;
                    case 'checkbox':
                        $type = 'checkbox';
                        break;
                    default:
                        $type = 'default';
                }
                $this->addField($this->createField($match[1], [], $type));
            }
        };

        $this->template = preg_replace_callback(
            '/\{\{\s*([\w_]+)\s*\|\s*(textarea|textedit|text|file|image|select|checkbox|radio)(\(?\)?)(.*?\}\})/usi',
            function($match) use ($createField){
                $createField($match);
                return "{{ {$match[1]} | {$match[2]}" . (($match[3] && $match[3] != '()') ? "('{$match[1]}', " : "('{$match[1]}')") . $match[4];
            },
            $this->template
        );

        $this->template = preg_replace_callback(
            '/\(\s*([\w_]+)\s*\|\s*(textarea|textedit|text|file|image|select|checkbox|radio)(\(?\)?)(.*?\))/usi',
            function($match) use ($createField){
                $createField($match);
                return "( {$match[1]} | {$match[2]}" . (($match[3] && $match[3] != '()') ? "('{$match[1]}', " : "('{$match[1]}')") . $match[4];
            },
            $this->template
        );

        if(preg_match_all('/\{\{\s*([\w_]+)\s*(?:\||\}\})/usi', $this->template, $matches, PREG_SET_ORDER)){
            foreach($matches as $match){
                if(!$this->hasField($match[1])){
                    $this->addField($this->createField($match[1]));
                }
            }
        }

        return $this;
    }


    /**
     * @param string $storage
     * @return Storage
     */
    public function getStorage(){
        return $this->container->get('creonit_admin.component.storage.' . ($this->storage ?: 'default'));
    }

    /**
     * @param $storage
     * @return Pattern
     */
    protected function setStorage($storage)
    {
        $this->storage = $storage;
        return $this;
    }

    /**
     * @param $name
     * @param array $parameters
     * @param $type
     * @return Field
     */
    public function createField($name, $parameters = [], $type = null){
        /** @var Field $field */
        $field = $this->container->get('creonit_admin.component.field.' . ($type ?: 'default'));
        $field->setName($name);
        $field->parameters->add($parameters);
        return $field;
    }
}