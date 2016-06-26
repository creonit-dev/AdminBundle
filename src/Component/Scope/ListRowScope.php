<?php

namespace Creonit\AdminBundle\Component\Scope;

use Creonit\AdminBundle\Component\ListComponent;

class ListRowScope extends Scope
{

    protected $independent = true;
    protected $recursive = false;
    protected $sortable = false;
    protected $collapsed = false;
    protected $pagination;

    public $relations = [];
    
    /** @var ListComponent */
    protected $parentScope;

    public function applySchemaAnnotation($annotation){

        switch($annotation['key']){
            case 'sortable':
                $this->setSortable((boolean) $annotation['value']);
                break;
            case 'collapsed':
                $this->setCollapsed((boolean) $annotation['value']);
                break;
            case 'pagination':
                $this->setPagination((int) $annotation['value']);
                break;
            case 'relation':
                if(preg_match('/^\s*([\w_]+)\s*>\s*([\w_-]+)\.([\w_]+)\s*$/ui', $annotation['value'], $match)){
                    $this->relations[] = [$match[1], $match[2], $match[3]];
                }
                break;
            default:
                parent::applySchemaAnnotation($annotation);
        }
        return $this;
    }


    public function setDependency(Scope $targetScope){
        if($this !== $targetScope){
            $this->independent = false;
        }else{
            $this->recursive = true;
        }

        return $this;
    }

    /**
     * @return boolean
     */
    public function isIndependent()
    {
        return $this->independent;
    }

    /**
     * @return boolean
     */
    public function isRecursive()
    {
        return $this->recursive;
    }

    public function dump()
    {
        return array_merge(parent::dump(), [
            'independent' => $this->independent,
            'recursive' => $this->recursive,
            'sortable' => $this->sortable,
            'collapsed' => $this->collapsed,
            'pagination' => !!$this->pagination,
        ]);
    }



    public function setSortable($value)
    {
        $this->sortable = $value;
        return $this;
    }

    public function setCollapsed($value)
    {
        $this->collapsed = $value;
        return $this;
    }

    /**
     * @return boolean
     */
    public function isCollapsed()
    {
        return $this->collapsed;
    }

    /**
     * @return boolean
     */
    public function isSortable()
    {
        return $this->sortable;
    }


    public function setPagination($pagination)
    {
        $this->pagination = $pagination;
        return $this;
    }


    public function getPagination()
    {
        return $this->pagination;
    }


}