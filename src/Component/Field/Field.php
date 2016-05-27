<?php

namespace Creonit\AdminBundle\Component\Field;

class Field
{

    protected $name;
    protected $default;

    public function __construct($name, $default = null)
    {
        $this->name = $name;
        $this->default = $default;
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


    public function getData(){
        return $this->default ?: $this->name . '_ok';
    }

    public function dump()
    {
        $field = [
            'name' => $this->name,
        ];
        return $field;
    }


}