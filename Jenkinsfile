node {
    stage 'Checkout'
    checkout scm

    stage 'Build'
    sh 'docker build -t belligerence/lyrics .'

    stage 'Publish'
    withCredentials([
    	[$class: 'UsernamePasswordMultiBinding', credentialsId: 'REGISTRY_CREDENTIALS', usernameVariable: 'docker_uname', passwordVariable: 'docker_password'],
    	[$class: 'StringBinding', credentialsId: 'REGISTRY_EMAIL', variable: 'docker_email'],
    	])
    {
        sh 'docker login -u ${docker_uname} -p ${docker_password} -e ${docker_email}  && docker push belligerence/lyrics'
    }

    stage 'Cleanup'
    sh 'docker rmi belligerence/lyrics && docker rmi node:4.4.6'
}