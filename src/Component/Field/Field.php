<?php

namespace Creonit\AdminBundle\Component\Field;

use Creonit\AdminBundle\Component\Pattern\Pattern;
use Creonit\AdminBundle\Component\Request\ComponentRequest;
use Creonit\AdminBundle\Component\Storage\Storage;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\ParameterBag;
use Symfony\Component\Validator\Constraints\Email;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\ValidatorBuilder;

class Field
{

    protected $name;
    protected $default;
    protected $data;
    public $attributes;
    public $parameters;

    /** @var  Pattern */
    protected $pattern;


    /** @var ContainerInterface */
    protected $container;

    public function __construct(ContainerInterface $container){
        $this->container = $container;
        $this->attributes = new ParameterBag;
        $this->parameters = new ParameterBag;
    }

    /**
     * @param mixed $name
     * @return Field
     */
    public function setName($name)
    {
        $this->name = $name;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getName()
    {
        return $this->name;
    }


    public function dump()
    {
        $field = [
            'name' => $this->name,
        ];
        return $field;
    }

    public function setPattern(Pattern $pattern)
    {
        $this->pattern = $pattern;
        return $this;
    }

    public function validate(){
        return ($required = $this->parameters->get('required')) || $this->parameters->has('validation')
            ? $this->container->get('validator')->validate(
                $this->data,
                $required
                    ? array_merge($this->parameters->get('constraints', []), [new NotBlank(true === $required ? [] : ['message' => $required])])
                    : $this->parameters->get('constraints'))
            : [];

    }

    public function process($data){
        return $data;
    }

    public function decorate($data){
        return $data;
    }

    public function save(Storage $storage, $entity)
    {
        if(null !== $this->data){
            $this->data = $this->process($this->data);
        }

        if(null !== $this->data || $this->attributes->count()){
            $storage->setData($entity, $this);
        }

    }

    public function extract(ComponentRequest $request)
    {
        if($request->data->has($this->name)){
            $this->data = $request->data->get($this->name);
        }
    }

    public function load(Storage $storage, $entity)
    {
        $this->data = $this->decorate($storage->getData($entity, $this));
    }


    /**
     * @return mixed
     */
    public function getData()
    {
        return $this->data;
    }


}