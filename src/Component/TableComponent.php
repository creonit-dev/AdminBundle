<?php

namespace Creonit\AdminBundle\Component;

use AppBundle\Model\Base\ProductCategory;
use Creonit\AdminBundle\Component\Request\ComponentRequest;
use Creonit\AdminBundle\Component\Response\ComponentResponse;
use Creonit\AdminBundle\Component\Scope\ListRowScopeRelation;
use Creonit\AdminBundle\Component\Scope\TableRowScope;
use Propel\Runtime\Map\TableMap;

abstract class TableComponent extends ListComponent
{

    protected $scopesType = TableRowScope::class;
    protected $columns = [];

    /**
     * @param string $columns
     * @return TableComponent
     */
    public function setColumns($columns)
    {
        if(preg_match_all('/\s*([\'\"].+?[\'\"]|.+?)\s*(?:,|$)/usi', $columns, $matches, PREG_SET_ORDER)){
            $columns = [];
            foreach ($matches as $match){
                $width = 'auto';
                $value = $match[1];

                if($value[0] == '.'){
                    $width = '1%';
                    $value = ltrim($value, '.');
                }

                $columns[] = ['value' => trim($value, "'\""), 'width' => $width];
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

    public function prepareTemplate()
    {
        if(!$this->template){
            $this->setTemplate($this->container->get('templating')->render('CreonitAdminBundle:Components:table.html.twig', ['component' => $this]));
        }
        return parent::prepareTemplate();
    }

    protected function prepareSchema()
    {
        $this->initializeRelations();
        $this->addHandler('_delete', function (ComponentRequest $request, ComponentResponse $response){
            $query = $request->query;
            if($query->has('key') and $query->has('scope') and $this->hasScope($query->get('scope'))){
                $scope = $this->getScope($query->get('scope'));

                if($entity = $scope->createQuery()->findPk($query->get('key'))){
                    $entity->delete();
                    $response->data->set('success', true);

                }else{
                    $response->flushError('Элемент не найден');
                }

            }else{
                $response->flushError('Ошибка при выполнения запроса');
            }
        });


        $this->addHandler('_visible', function (ComponentRequest $request, ComponentResponse $response){
            $query = $request->query;
            if(
                $request->data->has('visible')
                and $query->get('key')
                and $scope = $query->get('scope')
                and $this->hasScope($scope)
            ){
                $scope = $this->getScope($scope);

                if($entity = $scope->createQuery()->findPk($query->get('key'))){
                    $visible = $request->data->getBoolean('visible');
                    $visibleField = $this->createField('visible');
                    $visibleField->save($entity, $visible);
                    $entity->save();

                    $response->data->set('success', true);
                    $response->data->set('visible', $visibleField->load($entity));

                }else{
                    $response->flushError('Элемент не найден');
                }

            }else{
                $response->flushError('Ошибка при выполнения запроса');
            }
        });

        $this->addHandler('_sort', function (ComponentRequest $request, ComponentResponse $response){
            $query = $request->query;
            if($query->has('key') and $query->has('scope') and $this->hasScope($query->get('scope'))){
                $scope = $this->getScope($query->get('scope'));

                if($entity = $scope->createQuery()->findPk($query->get('key'))){
                    if($request->data->get('prev') and $prev = $scope->createQuery()->findPk($request->data->get('prev'))){
                        $entity->moveToRank($entity->getRank() > $prev->getRank() ? $prev->getRank()+1 : $prev->getRank());
                        $entity->moveToRank($entity->getRank() > $prev->getRank() ? $prev->getRank()+1 : $prev->getRank());
                    }else{
                        $entity->moveToTop();
                    }

                    $response->data->set('success', true);

                }else{
                    $response->flushError('Элемент не найден');
                }

            }else{
                $response->flushError('Ошибка при выполнения запроса');
            }
        });

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

    public function dump()
    {
        return array_replace(parent::dump(), [
            'columns' => $this->columns
        ]);
    }


}