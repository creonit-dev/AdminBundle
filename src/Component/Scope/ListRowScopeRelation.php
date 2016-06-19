<?php

namespace Creonit\AdminBundle\Component\Scope;

use Creonit\AdminBundle\Component\Field\Field;

class ListRowScopeRelation
{
    /** @var Scope  */
    protected $sourceScope;

    /** @var Field  */
    protected $sourceField;

    /** @var Scope  */
    protected $targetScope;

    /** @var Field  */
    protected $targetField;

    public function __construct(Scope $sourceScope, Field $sourceField, Scope $targetScope, Field $targetField)
    {
        $this->sourceScope = $sourceScope;
        $this->sourceField = $sourceField;
        $this->targetScope = $targetScope;
        $this->targetField = $targetField;
    }

    public function getSourceScope()
    {
        return $this->sourceScope;
    }

    public function getSourceField()
    {
        return $this->sourceField;
    }

    public function getTargetScope()
    {
        return $this->targetScope;
    }

    public function getTargetField()
    {
        return $this->targetField;
    }

    public function isRecursive(){
        return $this->sourceScope === $this->targetScope;
    }

    public function dump(){
        return [
            'source' => ['scope' => $this->sourceScope->getName(), 'field' => $this->sourceField->getName()],
            'target' => ['scope' => $this->targetScope->getName(), 'field' => $this->targetField->getName()],
        ];
    }


}