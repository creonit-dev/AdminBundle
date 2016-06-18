<?php

namespace Creonit\AdminBundle\Component\Scope;

class ScopeRelation
{
    protected $sourceScope;
    protected $sourceField;
    protected $targetScope;
    protected $targetField;

    public function __construct($sourceScope, $sourceField, $targetScope, $targetField)
    {
        $this->sourceScope = $sourceField;
        $this->sourceField = $sourceField;
        $this->targetScope = $targetScope;
        $this->targetField = $targetField;
    }

    /**
     * @return mixed
     */
    public function getSourceScope()
    {
        return $this->sourceScope;
    }

    /**
     * @return mixed
     */
    public function getSourceField()
    {
        return $this->sourceField;
    }

    /**
     * @return mixed
     */
    public function getTargetScope()
    {
        return $this->targetScope;
    }

    /**
     * @return mixed
     */
    public function getTargetField()
    {
        return $this->targetField;
    }


}