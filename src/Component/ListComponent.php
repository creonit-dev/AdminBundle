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
    protected $height;

    /** @var ListRowScopeRelation[] */
    protected $relations = [];

    /**
     * @param mixed $height
     */
    public function setHeight($height)
    {
        $this->height = $height;
    }

    /**
     * @return mixed
     */
    public function getHeight()
    {
        return $this->height;
    }


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
            case 'height':
                $this->setHeight($annotation['value']);
                break;
            default:
                parent::applySchemaAnnotation($annotation);
        }
    }


    protected function loadData(ComponentRequest $request, ComponentResponse $response)
    {
        foreach($this->scopes as $scope){
            if($scope->isIndependent()){
                if($scope->isRecursive()){
                    $this->getData($request, $response, $scope, $this->findRelations($scope, $scope)[0]);
                }else{
                    $this->getData($request, $response, $scope);
                }
            }
        }
    }

    /**
     * @param ComponentRequest $request
     * @param ComponentResponse $response
     * @param ListRowScope $scope
     * @param null|ListRowScopeRelation $relation
     * @param null $relationValue
     * @param int $level
     * @return array
     */
    protected function getData(ComponentRequest $request, ComponentResponse $response, ListRowScope $scope, $relation = null, $relationValue = null, $level = 0){
        $mask = $scope->getName() . '.' . ($relation ? $relation->getTargetScope()->getName() . '.' . $relationValue : '_');
        $entities = [];

        $query = $this->getQuery($request, $response, $scope, $relation, $relationValue, $level);

        if($pagination = $scope->getPagination()){
            $queryPagination = $request->query->get('pagination');
            $queryResult = $query->paginate(isset($queryPagination[$mask]) ? $queryPagination[$mask] : 1, $pagination);

            $responsePagination = $response->data->get('pagination', []);
            $responsePagination[$mask] = ['last_page' => $queryResult->getLastPage(), 'page' => $queryResult->getPage()];
            $response->data->set('pagination', $responsePagination);

        }else{
            $queryResult = $query->find();
        }

        foreach($queryResult as $entity){
            $entityData = new ParameterBag();
            foreach($scope->getFields() as $field){
                $entityData->set($field->getName(), $field->load($entity));
                $entityData->set('_key', $entity->getPrimaryKey());
            }
            $this->decorate($request, $response, $entityData, $entity, $scope, $relation, $relationValue, $level);
            $entities[] = $entityData;
        }


        if($entities){
            $expanded = $request->query->get('expanded');
            foreach ($this->findRelations(null, $scope) as $rel){
                /** @var ParameterBag $entityData */
                foreach($entities as $entityData) {
                    if($scope->isCollapsed()){
                        $relQuery = $this->getQuery($request, $response, $rel->getSourceScope(), $rel, $entityData->get($rel->getTargetField()->getName()), $level+1);
                        if($hasChildren = $relQuery->count()){
                            $entityData->set('_has_children', true);
                        }

                        if(empty($expanded[$mask]) || !in_array($entityData->get('_key'), $expanded[$mask])){
                            continue;
                        }else if(!$hasChildren){
                            continue;
                        }
                    }

                    $this->getData($request, $response, $rel->getSourceScope(), $rel, $entityData->get($rel->getTargetField()->getName()), $level+1);
                }
            }
        }

        $responseEntities = $response->data->get('entities', []);
        $responseEntities[$mask] = array_map(function($entityData){return $entityData->all();} , $entities);
        $response->data->set('entities', $responseEntities);
    }

    /**
     * @param ComponentRequest $request
     * @param ComponentResponse $response
     * @param ListRowScope $scope
     * @param null|ListRowScopeRelation $relation
     * @param null $relationValue
     * @param int $level
     * @return ModelCriteria
     */
    protected function getQuery(ComponentRequest $request, ComponentResponse $response, ListRowScope $scope, $relation = null, $relationValue = null, $level = 0){
        $query = $scope->createQuery();

        if(null !== $relation){
            $query->add($relation->getSourceField()->getName(), $relationValue);
        }

        if($scope->getTableMap()->hasColumn('sortable_rank')){
            $query->orderBySortableRank();
        }

        $this->filter($request, $response, $query, $scope, $relation, $relationValue, $level);

        return $query;
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

    protected function filter(ComponentRequest $request, ComponentResponse $response, $query, Scope $scope, $relation, $relationValue, $level)
    {
    }

    protected function decorate(ComponentRequest $request, ComponentResponse $response, ParameterBag $data, $entity, Scope $scope, $relation, $relationValue, $level)
    {
    }

}