<?php

namespace Creonit\AdminBundle\Component;

use Creonit\AdminBundle\Component\Field\Field;
use Creonit\AdminBundle\Component\Pattern\TablePattern;
use Creonit\AdminBundle\Component\Request\ComponentRequest;
use Creonit\AdminBundle\Component\Response\ComponentResponse;

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
        $this->setTemplate($this->container->get('templating')->render('CreonitAdminBundle:Components:table.html.twig', ['component' => $this]));



        $this->setHandler('_delete', function (ComponentRequest $request, ComponentResponse $response){
            $query = $request->query;
            if($query->has('key') and $query->has('pattern') and $this->hasPattern($query->get('pattern'))){
                $pattern = $this->getPattern($query->get('pattern'));
                $storage = $pattern->getStorage();
                $entity = $storage->getEntity([
                    'entity' => $pattern->getEntity(),
                    'key' => $query->get('key')
                ]);

                if($entity){
                    $storage->deleteEntity($entity);
                    $response->data->set('success', true);
                    
                }else{
                    $response->flushError('Элемент не найден');
                }
                
            }else{
                $response->flushError('Ошибка при выполнения запроса');
            }
        });


        $this->setHandler('_visible', function (ComponentRequest $request, ComponentResponse $response){
            $query = $request->query;
            if(
                $request->data->has('visible')
                and $query->get('key')
                and $pattern = $query->get('pattern')
                and $this->hasPattern($pattern)
            ){
                $pattern = $this->getPattern($pattern);
                $storage = $pattern->getStorage();
                $entity = $storage->getEntity([
                    'entity' => $pattern->getEntity(),
                    'key' => $query->get('key')
                ]);

                if($entity){
                    $visible = $request->data->getBoolean('visible');


                    $field = $pattern->createField('visible');
                    $field->setData($visible);
                    $storage->setData($entity, $field);
                    $storage->saveEntity($entity);

                    $visible = $storage->getData($entity, $field);

                    $response->data->set('success', true);
                    $response->data->set('visible', $visible);

                }else{
                    $response->flushError('Элемент не найден');
                }

            }else{
                $response->flushError('Ошибка при выполнения запроса');
            }
        });

    }

    /**
     * @param $name
     * @return TablePattern
     */
    public function createPattern($name)
    {
        $pattern = $this->container->get('creonit_admin.component.pattern.table');
        $pattern->setName($name);
        return $pattern;
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