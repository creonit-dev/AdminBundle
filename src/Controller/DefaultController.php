<?php

namespace Creonit\AdminBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

class DefaultController extends Controller
{

    /**
     * @Route("/", name="creonit_admin_index")
     */
    public function indexAction(Request $request)
    {
        $admin = $this->get('creonit_admin');

        if($request->request->has('request')){
            return $admin->handleRequest($request);
        }

        $moduleToRedirect = null;
        foreach($admin->getModules() as $module){
            if($module->isVisible() and $module->checkPermission($this->getUser())){
                $moduleToRedirect = $module;
                break;
            }
        }

        if(null === $moduleToRedirect){
            throw $this->createNotFoundException();
        }

        return $this->redirect($this->generateUrl('creonit_admin_module', ['module' => lcfirst($module->getName())]));
    }

    /**
     * @Route("/{module}/", name="creonit_admin_module")
     */
    public function moduleAction($module)
    {
        $admin = $this->get('creonit_admin');

        $module = ucfirst($module);
        
        if(!$admin->hasModule($module)){
            throw $this->createNotFoundException();
        }

        $module = $admin->getModule($module);

        if(!$module->isVisible() or !$module->checkPermission($this->getUser())){
            throw $this->createNotFoundException();
        }

        $admin->setActiveModule($module);

        return $this->render('CreonitAdminBundle:Default:module.html.twig', ['admin' => $admin, 'module' => $module]);
    }



}
