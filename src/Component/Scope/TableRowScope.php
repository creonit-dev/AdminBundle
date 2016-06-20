<?php

namespace Creonit\AdminBundle\Component\Scope;

class TableRowScope extends ListRowScope
{

    protected $columns = [];

    public function applySchemaAnnotation($annotation){
        switch($annotation['key']){
            case 'col':
            case 'column':
                $this->addColumn($annotation['value']);
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