<?php

namespace Creonit\AdminBundle\Component;

use Creonit\AdminBundle\Component\Request\ComponentRequest;
use Creonit\AdminBundle\Component\Response\ComponentResponse;
use Creonit\AdminBundle\Component\Scope\ListRowScope;
use Creonit\AdminBundle\Component\Scope\Scope;
use Creonit\AdminBundle\Component\Scope\ListRowScopeRelation;
use Propel\Runtime\ActiveQuery\ModelCriteria;
use Symfony\Component\HttpFoundation\ParameterBag;

abstract class ListComponent extends Component
{

    /** @var ListRowScope[] */
    protected $scopes = [];

    protected $header = '';

    /** @var ListRowScopeRelation[] */
    protected $relations = [];


    public function addRelation(ListRowScopeRelation $relation){
        $this->relations[] = $relation;
        return $this;
    }



    /**
     * @param string $header
     */
    public function setHeader($header)
    {
        $this->header = $header;
    }

    /**
     * @return string
     */
    public function getHeader()
    {
        return $this->header;
    }

    protected function prepareSchema()
    {
        $this->initializeRelations();
    }

    protected function initializeRelations(){
        foreach ($this->scopes as $scope){
            if($scope->relations){
                foreach ($scope->relations as $relation){
                    $sourceScope = $scope;
                    if($scope->hasField($relation[0])){
                        $sourceField = $scope->getField($relation[0]);
                    }else{
                        $scope->addField($sourceField = $scope->createField($relation[0]));
                    }

                    $targetScope = $this->getScope($relation[1]);
                    if($targetScope->hasField($relation[2])){
                        $targetField = $targetScope->getField($relation[2]);
                    }else{
                        $targetScope->addField($targetField = $targetScope->createField($relation[2]));
                    }

                    $sourceScope->setDependency($targetScope);

                    $this->addRelation(new ListRowScopeRelation($sourceScope, $sourceField, $targetScope, $targetField));
                }
            }
        }

        if($this->relations){
            uasort(
                $this->relations,
                function(ListRowScopeRelation $a, ListRowScopeRelation $b){
                    return $a->getSourceScope() === $b->getTargetScope() ? -1 : 0;
                }
            );
        }
    }


    public function applySchemaAnnotation($annotation)
    {
        switch($annotation['key']){
            case 'header':
                $this->setHeader($annotation['value']);
                break;
            default:
                parent::applySchemaAnnotation($annotation);
        }
    }


    protected function loadData(ComponentRequest $request, ComponentResponse $response)
    {
        $data = new ParameterBag();

        foreach($this->scopes as $scope){
            if($scope->isIndependent()){
                if($scope->isRecursive()){
                    $this->getData($request, $response, $data, $scope, $this->findRelations($scope, $scope)[0]);
                }else{
                    $this->getData($request, $response, $data, $scope);
                }
            }
        }

        $response->data->set('entities', $data->all());

    }

    /**
     * @param ComponentRequest $request
     * @param ComponentResponse $response
     * @param ParameterBag $data
     * @param Scope $scope
     * @param null|ListRowScopeRelation $relation
     * @param null $relationValue
     * @param int $level
     * @return array
     */
    protected function getData(ComponentRequest $request, ComponentResponse $response, ParameterBag $data, Scope $scope, $relation = null, $relationValue = null, $level = 0){
        $entities = [];
        $query = $scope->createQuery();

        if(null !== $relation){
            $query->add($relation->getSourceField()->getName(), $relationValue);
        }
        
        if($scope->getTableMap()->hasColumn('sortable_rank')){
            $query->orderBySortableRank();
        }

        $this->filter($request, $response, $query, $scope, $relation, $relationValue, $level);

        foreach($query->find() as $entity){
            $entityData = new ParameterBag();
            foreach($scope->getFields() as $field){
                $entityData->set($field->getName(), $field->load($entity));
                $entityData->set('_key', $entity->getPrimaryKey());
            }
            $this->decorate($request, $response, $entityData, $scope, $relation, $relationValue, $level);
            $entities[] = $entityData->all();
        }


        if($entities){
            foreach ($this->findRelations(null, $scope) as $rel){
                foreach($entities as $entity) {
                    $this->getData($request, $response, $data, $rel->getSourceScope(), $rel, $entity[$rel->getTargetField()->getName()], $level+1);
                }
            }
        }

        $data->set($scope->getName() . '.' . ($relation ? $relation->getTargetScope()->getName() . '.' . $relationValue : '_'), $entities);
    }

    public function dump()
    {
        $data = parent::dump();
        foreach ($this->relations as $relation) {
            $data['relations'][] = $relation->dump();
        }
        return $data;
    }


    public function findRelations($sourceScope = null, $targetScope = null){
        $relations = [];
        foreach ($this->relations as $relation) {
            if(null !== $sourceScope and $relation->getSourceScope() !== $sourceScope) continue;
            if(null !== $targetScope and $relation->getTargetScope() !== $targetScope) continue;
            $relations[] = $relation;
        }
        return $relations;
    }

    protected function filter(ComponentRequest $request, ComponentResponse $response, ModelCriteria $query, Scope $scope, $relation, $relationValue, $level)
    {
    }

    protected function decorate(ComponentRequest $request, ComponentResponse $response, ParameterBag $data, Scope $scope, $relation, $relationValue, $level)
    {
    }
}