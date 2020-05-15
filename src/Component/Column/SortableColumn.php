<?php


namespace Creonit\AdminBundle\Component\Column;


use Propel\Runtime\ActiveQuery\Criteria;

class SortableColumn
{
    protected $name;
    protected $direction;

    /**
     * @return mixed
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * @param mixed $name
     * @return SortableColumn|$this
     */
    public function setName($name)
    {
        $this->name = $name;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getDirection()
    {
        return $this->direction;
    }

    /**
     * @param mixed $direction
     * @return SortableColumn|$this
     */
    public function setDirection($direction)
    {
        $this->direction = $direction;
        return $this;
    }

    public function getCriteriaDirection()
    {
        return $this->direction === 'asc' ? Criteria::ASC : Criteria::DESC;
    }
}