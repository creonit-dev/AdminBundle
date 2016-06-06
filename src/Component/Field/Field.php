<?php

namespace Creonit\AdminBundle\Component\Field;

use Creonit\AdminBundle\Component\Pattern\Pattern;
use Symfony\Component\DependencyInjection\ContainerInterface;

class Field
{

    protected $name;
    protected $default;

    /** @var  Pattern */
    protected $pattern;


    /** @var ContainerInterface */
    protected $container;

    public function __construct(ContainerInterface $container){
        $this->container = $container;
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

    public function processData($data){
        return $data;
    }

    public function decorateData($data){
        return $data;
    }

    public function setPattern(Pattern $pattern)
    {
        $this->pattern = $pattern;
        return $this;
    }

    /**
     * @param array $options
     * @return $this
     */
    public function setOptions(array $options){
        return $this;
    }

}