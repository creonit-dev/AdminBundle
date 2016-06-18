<?php

namespace Creonit\AdminBundle\Component\Field;

use Creonit\AdminBundle\Component\Request\ComponentRequest;
use Propel\Runtime\Map\TableMap;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\ParameterBag;
use Symfony\Component\Validator\Constraints\NotBlank;

class Field
{

    protected $name;
    protected $default;
    public $attributes;
    public $parameters;


    /** @var ContainerInterface */
    protected $container;

    public function __construct(ContainerInterface $container){
        $this->container = $container;
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


    public function validate($data){
        return ($required = $this->parameters->get('required')) || $this->parameters->has('constraints')
            ? $this->container->get('validator')->validate(
                $data,
                $required
                    ? array_merge($this->parameters->get('constraints', []), [new NotBlank(true === $required ? [] : ['message' => $required])])
                    : $this->parameters->get('constraints'))
            : [];

    }

    public function process($data){
        return $data;
    }

    public function save($entity, $data)
    {
        if(null !== $data){
            $entity->setByName($this->name, $this->process($data), TableMap::TYPE_FIELDNAME);
        }

    }

    public function extract(ComponentRequest $request)
    {
        if($request->data->has($this->name)){
            return $request->data->get($this->name);
        }
        return null;
    }

    public function load($entity)
    {
        return $this->decorate($entity->getByName($this->name, TableMap::TYPE_FIELDNAME));
    }

    public function decorate($data){
        return $data;
    }


}