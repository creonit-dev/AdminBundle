<?php

namespace Creonit\AdminBundle\Component\Pattern;

class TablePattern extends ListPattern
{
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