# comment

## 开发期间关于Git版本控制规划

### Git创建Develop分支的命令
git checkout -b develop master


### 将Develop分支发布到Master分支的命令
git checkout master

git merge --no-ff develop


### 开发的都在 develop 中创建自己的功能分支
git checkout -b feature-x develop

#### 开发完成后，将功能分支合并到develop分支
git checkout develop

git merge --no-ff feature-x
#### 删除feature分支
git branch -d feature-x


### 创建一个预发布分支
git checkout -b release-1.2 develop
#### 确认没有问题后，合并到master分支
git checkout master

git merge --no-ff release-1.2

#### 对合并生成的新节点，做一个标签
git tag -a 1.2

#### 再合并到develop分支
git checkout develop

git merge --no-ff release-1.2
#### 最后，删除预发布分支
git branch -d release-1.2


### 创建一个修补bug分支
git checkout -b fixbug-0.1 master
#### 修补结束后，合并到master分支
git checkout master

git merge --no-ff fixbug-0.1

git tag -a 0.1.1

#### 再合并到develop分支
git checkout develop

git merge --no-ff fixbug-0.1
#### 最后，删除"修补bug分支"
git branch -d fixbug-0.1


