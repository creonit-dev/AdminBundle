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
        if($request->request->has('request')){
            return $this->get('creonit_admin')->handleRequest($request);
        }

        return $this->redirect($this->generateUrl('creonit_admin_module', ['module' => 'page']));
    }

    /**
     * @Route("/{module}/", name="creonit_admin_module")
     */
    public function moduleAction($module)
    {
        $admin = $this->get('creonit_admin');

        $module = ucfirst($module);
        
        if(!$admin->hasModule($module)){
            $this->createNotFoundException();
        }

        $module = $admin->getModule($module);
        $admin->setActiveModule($module);

        return $this->render('CreonitAdminBundle:Default:module.html.twig', ['module' => $module]);
    }



}
