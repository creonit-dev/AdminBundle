<?php

namespace Creonit\AdminBundle\Component;

use Creonit\AdminBundle\Component\Pattern\TablePattern;

abstract class TableComponent extends ListComponent
{

    protected $columns = [];

    /**
     * @param array $columns
     * @return TableComponent
     */
    public function setColumns($columns)
    {
        if(preg_match_all('/\s*([\'\"].+?[\'\"]|.+?)\s*(?:,|$)/usi', $columns, $matches, PREG_SET_ORDER)){
            $columns = [];
            foreach ($matches as $match){
                $columns[] = trim($match[1], "'\"");
            }
            $this->columns = $columns;
        }
        return $this;
    }

    /**
     * @return array
     */
    public function getColumns()
    {
        return $this->columns;
    }

    protected function prepareSchema()
    {
        $this->setTemplate($this->manager->getTemplating()->render('CreonitAdminBundle:Components:table.html.twig', ['component' => $this]));
    }

    /**
     * @param $name
     * @return TablePattern
     */
    public function createPattern($name)
    {
        return new TablePattern($name);
    }

    public function applySchemaAnnotation($annotation)
    {
        switch($annotation['key']){
            case 'cols':
            case 'columns':
                $this->setColumns($annotation['value']);
                break;
            default:
                parent::applySchemaAnnotation($annotation);
        }
    }


}