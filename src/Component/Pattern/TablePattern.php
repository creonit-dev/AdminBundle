<?php

namespace Creonit\AdminBundle\Core\Component\Pattern;

use Creonit\AdminBundle\Component\Pattern\ListPattern;

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
        return parent::prepareTemplate();
    }

}