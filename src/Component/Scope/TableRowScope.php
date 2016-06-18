<?php

namespace Creonit\AdminBundle\Component\Scope;

use Creonit\AdminBundle\Component\TableComponent;

class TableRowScope extends Scope
{

    /** @var TableComponent */
    protected $parentScope;

    protected $columns = [];

    public function applySchemaAnnotation($annotation){
        switch($annotation['key']){
            case 'col':
            case 'column':
                $template = $annotation['value'];
                if(preg_match('/^\s*([\w_]+)\s*$/ui', $template, $match)){
                    $template = "{{ $match[1] }}";
                }
                $this->addColumn($template);
                break;
            case 'relation':
                if(preg_match('/^\s*([\w_]+)\s*>\s*([\w_-]+)\.([\w_]+)\s*$/ui', $annotation['value'], $match)){
                    $this->parentScope->addRelation(new ScopeRelation($this->getName(), $match[1], $match[2], $match[3]));
                }
                break;
            default:
                parent::applySchemaAnnotation($annotation);
        }
        return $this;
    }


    /**
     * @param $template
     * @return $this
     */
    public function addColumn($template)
    {
        $this->columns[] = $template;
        return $this;
    }

    public function prepareTemplate()
    {
        $this->setTemplate(implode('', array_map(function($column){return "<td>{$column}</td>";}, $this->columns)));

        if(preg_match('/_visible()/usi', $this->template)){
            if(!$this->hasField('visible')){
                $this->addField($this->createField('visible'));
            }
        }

        return parent::prepareTemplate();
    }

}