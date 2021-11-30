let activeSkillTree = alchemy;
let svgBox = document.getElementById("tree-viewer-svg");
let skillsIconsSVG = document.getElementsByClassName("skill-icon");

let buildLevel = 1;
let attributeTotals = [100, 100, 100]; //Magicka, Health, Stamina
let attributeIncreases = [0, 0, 0]; //Magicka, Health, Stamina
let mouseEnterLimiter = false;


let spentPerks = 0;
let unspentPerks = 0;
let totalAttributePoints = 0;
let unspentAttributes = 0;
let spentAttributes = 0;
let usedSkills = [];
let race = altmer;


function addChainArrays() {
    //run through every skill tree
    for (i = 0; i < skillsList.length; i++) {
        //run through every perk in skill tree
        for (j = 0; j < skillsList[i].perks.length; j++) {
            let perk = skillsList[i].perks[j];
            //chains are always 2 or 3 ranks
            if (perk.chain == 2) {
                let chainPerks = [];
                //add perk ranks in correct order to each perk in chain. There's probably a better way of doing this...
                if (perk.rank == 1) { 
                    perk.chainPerks.push(perk);
                    perk.chainPerks.push(skillsList[i].perks[j+1]);
                };
                if (perk.rank == 2) { 
                    perk.chainPerks.push(skillsList[i].perks[j-1]);
                    perk.chainPerks.push(perk);
                }
            }

            if (perk.chain == 3) {
                let chainPerks = [];
                //add perk ranks in correct order to each perk in chain. There's probably a better way of doing this...
                if (perk.rank == 1) { 
                    perk.chainPerks.push(perk);
                    perk.chainPerks.push(skillsList[i].perks[j+1]);
                    perk.chainPerks.push(skillsList[i].perks[j+2]);
                };
                if (perk.rank == 2) { 
                    perk.chainPerks.push(skillsList[i].perks[j-1]);
                    perk.chainPerks.push(perk);
                    perk.chainPerks.push(skillsList[i].perks[j+1]);
                }
                if (perk.rank == 3) {
                    perk.chainPerks.push(skillsList[i].perks[j-2]);
                    perk.chainPerks.push(skillsList[i].perks[j-1]);
                    perk.chainPerks.push(perk);
                }
            }
        }
    }
}
function drawStar(xPos, yPos, id) {
    let svgBoxRect = svgBox.getBoundingClientRect();

    let points=[21.47, 17.81, 30, 15, 21.47, 12.19, 22.98, 7.02, 17.81, 8.53, 15, 0, 12.19, 8.53, 7.02, 7.02, 8.53, 12.19, 0, 15, 8.53, 17.81, 7.02, 22.98, 12.19, 21.47, 15, 30, 17.81, 21.47, 22.98, 22.98, 21.47, 17.81];

    for (i = 0; i < points.length; i++) {
        if(i == 0 || i%2 == 0){
            points[i] = points[i]+xPos-15;
            points[i+1] = points[i+1]+yPos-15;
        }
    }

    let string = points.toString();
    string = string.replace(/,/g,' ');
    let newStar = newPerkStar(string, id);
    return newStar;
}

function newPerkStar (string, id) {
    var newStar = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    newStar.setAttribute("points", string);
    newStar.setAttribute("fill", "#000");
    newStar.setAttribute("class", "perk-circle");
    newStar.setAttribute("id", id);
    svgBox.appendChild(newStar);
    return newStar;

}

function newPerkLine (svgBox, x1, y1, x2, y2, strokeWidth) {
    var newLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    newLine.setAttribute("x1", x1);
    newLine.setAttribute("y1", y1);
    newLine.setAttribute("x2", x2);
    newLine.setAttribute("y2", y2);
    newLine.setAttribute("stroke", "rgba(93, 67, 50, 0.2)");
    newLine.setAttribute("stroke-width", strokeWidth);
    svgBox.appendChild(newLine);
    return newLine;
}

function newPerkCircle(svgBox, r, xPos, yPos, perkNum, id) {
    var newCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    newCircle.setAttribute("r", r);
    newCircle.setAttribute("cx", xPos);
    newCircle.setAttribute("cy", yPos);
    newCircle.setAttribute("id", id);
    newCircle.setAttribute("class", "perk-circle");
    svgBox.appendChild(newCircle);
    return newCircle;
}

function newPerkLabel (x, y, name, id) {
    var newLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    newLabel.setAttribute("font-size", "0.8em");
    newLabel.setAttribute("x", x);
    newLabel.setAttribute("y", y+25);
    newLabel.setAttribute('fill', '#000');
    newLabel.setAttribute("text-anchor", "middle");
    newLabel.setAttribute("id", id);
    newLabel.textContent = name;
    svgBox.appendChild(newLabel);
    return newLabel;
}
function newPerkLabelLine (x, name, parent) {
    var newLabel = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
    newLabel.setAttribute("x", x);
    newLabel.setAttribute("dy", '1.2em');
    newLabel.setAttribute('fill', '#000');
    newLabel.setAttribute("text-anchor", "middle");
    newLabel.textContent = name;
    parent.appendChild(newLabel);
    return newLabel;
}

function skillsClick(skillNum) {
    activeSkillTree = skillsList[skillNum];
    drawSkillTree();
}

function perkClick(pCircle, perkNum) {
    let clickedPerk = activeSkillTree.perks[perkNum];
    //check if perk is already taken
    if (pCircle.classList.contains('takenPerk')) {
        //check if perk is a chain
        if (clickedPerk.chain == 0) {
            removePerk(clickedPerk);
        }
        else { //perk is in chain
            //check if rank 2 is taken
            let perkRank2 = activeSkillTree.perks[perkNum+1];
            if (clickedPerk.chain == 2) {
                if (activeSkillTree.takenPerks.includes(perkRank2)) {
                    removePerkRank(perkRank2);
                    removePerk(clickedPerk);
                    let i = clickedPerk.labels.length - 1;
                    clickedPerk.labels[i].textContent = "0/" + perkRank2.chain;
                }

                else { //add rank 2
                    let i = clickedPerk.labels.length - 1;
                    clickedPerk.labels[i].textContent = perkRank2.rank + "/" + perkRank2.chain;
                    activeSkillTree.takenPerks.push(perkRank2);
                }
            }
            if (clickedPerk.chain == 3) { 
                let perkRank3 = activeSkillTree.perks[perkNum+2]
                //is rank 3 taken? then remove all ranks
                if (activeSkillTree.takenPerks.includes(perkRank3)) {
                    removePerkRank(perkRank3);
                    removePerkRank(perkRank2);
                    removePerk(clickedPerk);
                    let i = clickedPerk.labels.length - 1;
                    clickedPerk.labels[i].textContent = "0/" + perkRank2.chain;
                }

                //Rank 3 is not taken, is rank 2 taken?
                else if (activeSkillTree.takenPerks.includes(perkRank2)) {
                    //yes, add rank 3
                    let i = clickedPerk.labels.length - 1;
                    clickedPerk.labels[i].textContent = perkRank3.rank + "/" + perkRank3.chain;
                    activeSkillTree.takenPerks.push(perkRank3);
                } 
                //Rank 3 and 2 are not taken, so add rank 2
                else {
                    let i = clickedPerk.labels.length - 1;
                    clickedPerk.labels[i].textContent = perkRank2.rank + "/" + perkRank2.chain;
                    activeSkillTree.takenPerks.push(perkRank2);
                }
            };
            

        }
        //then, remove any perks dependent on this perk
    } else{
        //Check if required perk(s) taken
        //if yes, take new perk
        //if no, take required perk(s) then this one.
        let targetPerk = clickedPerk;

        if (targetPerk.preReqs.length != 0) { //perk has requirements
            //Special rule for perks that have OR requirements, rather than AND
            if( targetPerk.choiceNeeded != null) {
                let requirementMet = false;
                for (p = 0; p < targetPerk.preReqs.length; p++) {
                    if (activeSkillTree.takenPerks.includes(activeSkillTree.perks[targetPerk.preReqs[p]])){ requirementMet = true};
                }
                if (requirementMet == true) {
                    takePerk(targetPerk);
                } else {
                    let perk1Name = activeSkillTree.perks[targetPerk.preReqs[0]].name;
                    let perk2Name = activeSkillTree.perks[targetPerk.preReqs[1]].name;
                    perk1Name = perk1Name.replace("<br>",' '); perk2Name = perk2Name.replace("<br>",' ');

                    let alertContainer = document.getElementById("alert");
                    let alertText = document.getElementById("alert-box-text");
                    alertText.textContent= "This perk requires " + perk1Name + " or " + perk2Name + ". Please select one before taking this perk.";

                    alertContainer.style.display = "flex";
                }               
                
            }
            //special rule for perks that can't be taken at the same time as another perk 
            else if (targetPerk.thisOr != null) {
                if (checkExclusivity(targetPerk) == true) {
                    takeRequiredPerks(targetPerk);
                } else {
                    let perkName = targetPerk.name.replace("<br>",' ');
                    let otherPerkName = activeSkillTree.perks[targetPerk.thisOr[0]].name.replace("<br>",' ');

                    let alertContainer = document.getElementById("alert");
                    let alertText = document.getElementById("alert-box-text");
                    alertText.textContent= perkName +" cannot be taken as " + otherPerkName + " has already been taken.";

                    alertContainer.style.display = "flex";
                }
            }
            else {
                takeRequiredPerks(targetPerk);
            }
        
        } 
        else 
            { //take perk if it has no requirements
                if (checkExclusivity(targetPerk) == true) {
                    takePerk(targetPerk);
                }
                else {
                    let perkName = targetPerk.name.replace("<br>",' ');
                    let otherPerkName = activeSkillTree.perks[targetPerk.thisOr[0]].name.replace("<br>",' ');
                    let alertContainer = document.getElementById("alert");
                    let alertText = document.getElementById("alert-box-text");
                    alertText.textContent= perkName +" cannot be taken as " + otherPerkName + " has already been taken.";

                    alertContainer.style.display = "flex";
                }
                
            }
        }
    updateSkillLists();
    saveData();
    perkMouseEnter(perkNum);
}

function checkExclusivity(targetPerk) {
    let canTake = true;
    if (targetPerk.thisOr != null) {
        for (i = 0; i < targetPerk.thisOr.length; i++) {
            let perk = activeSkillTree.perks[targetPerk.thisOr[i]];
            if (activeSkillTree.takenPerks.includes(perk)) {
                canTake = false;
            }
        }
    }    
    return canTake;
}

function takeRequiredPerks(targetPerk) {
    let requiredPerks = [];
    //add required perks of target perk to requiredPerks array
    for (p = 0; p < targetPerk.preReqs.length; p++) {
        let perkToAdd = activeSkillTree.perks[targetPerk.preReqs[p]];
        requiredPerks.push(perkToAdd);
    }
    //loop through requiredPerks, adding to it as we go
    for (i = 0; i < requiredPerks.length; i++) {
        let perk = requiredPerks[i];
        //Get required perks of each perk in requiredPerks, and add them to requiredPerks if not already
        if (perk.preReqs.length != 0) {
            for (j = 0; j < perk.preReqs.length; j++) {

                let perkToAdd2 = activeSkillTree.perks[perk.preReqs[j]];

                if (!requiredPerks.includes(perkToAdd2)) 
                {
                    requiredPerks.push(perkToAdd2);
                }
            }
        }

        if (i > 50) { break } //failsafe to prevent infinite loop
    }
    for (r = 0; r < requiredPerks.length; r++) {
        takePerk(requiredPerks[r]);
    }

    takePerk(targetPerk);
}

function takePerk(perk) {
    if (!activeSkillTree.takenPerks.includes(perk)) {
        activeSkillTree.takenPerks.push(perk);
        takePerkCSS(perk);
    }
}

function takePerkCSS(perk) {
    //no chain perks
    if (perk.chain == 0 || perk.rank == 1) {
        //update skill icon circle
        perk.iconCircle.classList.add("takenPerk")
        //update all perk lines
        for (l = 0; l < perk.lines.length; l++) {
            perk.lines[l].classList.add("takenPerkLine");
        }
        //check if perk is in active skill tree or not
        if (activeSkillTree.perks.includes(perk)) {
            //add taken class to circle
            perk.circle.classList.add("takenPerk");

            //update labels
            for (a = 0; a < perk.labels.length; a++) {
                perk.labels[a].classList.add('takenPerk');
            };

            if (perk.chain != 0 && perk.rank == 1) {
                let r = perk.labels.length - 1;
                perk.labels[r].textContent = perk.rank + "/" + perk.chain;
            };
        };
    };
}

function removePerk(perk) {
    removePerk2(perk);
    removeLoosePerks(activeSkillTree);
    updatePerkRankLabels();
}

function removePerk2(perk) {
    let skillTree = perk.skill;
    for (i = 0; i < skillTree.takenPerks.length; i++) {
        if (skillTree.takenPerks[i] == perk) {
            skillTree.takenPerks.splice(i, 1);
        }
    }

    if (skillTree == activeSkillTree) {
        perk.circle.classList.remove('takenPerk');
        for (j = 0; j < perk.labels.length; j++) {
            perk.labels[j].classList.remove('takenPerk');
            perk.labels[j].setAttribute("fill", "#000");
        }
    }
    
    perk.iconCircle.classList.remove('takenPerk');

    for (j = 0; j < perk.lines.length; j++) {
        perk.lines[j].classList.remove('takenPerkLine');
        perk.lines[j].setAttribute("stroke", "rgba(93, 67, 50, 0.25)");
    }
    
}

function removeLoosePerks(skill) {
    //Run through all taken perks of active skill list
    let perksToRemove = []
    for (h = 0; h < skill.takenPerks.length; h++){
        
        let requiredPerks = [];
        let targetPerk = skill.takenPerks[h];

        if (targetPerk.preReqs.length != 0) { //perk has requirements

                //add required perks of target perk to requiredPerks array
                for (p = 0; p < targetPerk.preReqs.length; p++) {
                    let perkToAdd = skill.perks[targetPerk.preReqs[p]];
                    requiredPerks.push(perkToAdd);
                }
                //loop through requiredPerks, adding to it as we go
                for (i = 0; i < requiredPerks.length; i++) {
                    let perk = requiredPerks[i];
                    //Get required perks of each perk in requiredPerks, and add them to requiredPerks if not already
                    if (perk.preReqs.length != 0) {
                        for (j = 0; j < perk.preReqs.length; j++) {

                            let perkToAdd2 = skill.perks[perk.preReqs[j]];

                            if (!requiredPerks.includes(perkToAdd2)) 
                            {
                                requiredPerks.push(perkToAdd2);
                            }
                        }
                    }

                    if (i > 50) { break } //failsafe to prevent infinite loop
                }
            for (r = 0; r < requiredPerks.length; r++) {
                if (!skill.takenPerks.includes(requiredPerks[r])) {
                    perksToRemove.push(targetPerk);
                }
            }        
        } 
    }

    perksToRemove.forEach(perkToRemove => {
        if(perkToRemove.chain == 0 || perkToRemove.rank == 1) {
            removePerk2(perkToRemove);
        } else {
            removePerkRank(perkToRemove);
        }

    });
}

function removePerkRank(perk) {
    let skillTree = perk.skill;
    for (i = 0; i < skillTree.takenPerks.length; i++) {
        if (skillTree.takenPerks[i] == perk) {
            skillTree.takenPerks.splice(i, 1);
        }
    }
}

function updatePerkRankLabels() {
    //for every perk in active skill tree
    for (i = 0; i < activeSkillTree.perks.length; i++) {
        let perk = activeSkillTree.perks[i];
        //if first rank in chain
        if (perk.rank == 1) {
            //count how many ranks are taken
            let r = 0;
            for (j = 0; j < perk.chainPerks.length; j++) {
                if (activeSkillTree.takenPerks.includes(perk.chainPerks[j])) {
                    r++;
                }
            }
            //update label
            let x = perk.labels.length - 1;
            perk.labels[x].textContent = r +"/"+perk.chain;
        }

    }
}

function clearSkillTree(svgToClear) {
    while (svgToClear.lastChild) {
        svgToClear.removeChild(svgToClear.lastChild);
    }
}

function drawSkillTree() {
    clearSkillTree(svgBox);
    //Get SVG area
    let svgBoxRect = svgBox.getBoundingClientRect();
    
    //Run through each perk in skillTree
    for (let i = 0; i < activeSkillTree.perks.length; i++) {

        let perk  = activeSkillTree.perks[i];
        let curXPos = perk.xPos / 100 * svgBoxRect.width;
        let curYPos = perk.yPos / 100 * svgBoxRect.height;

        //Draw lines first, so circles draw on top
        //Only draw lines for 1 perk from each rank, we'll use the last as it's easier to filter

        if(perk.preReqs.length != 0) {
            //loop through required perks
            for (let j = 0; j < perk.preReqs.length; j++) {
                let preReqsNum = perk.preReqs[j];
                let preReqPerk = activeSkillTree.perks[preReqsNum]; //This is the required perk for current perk

                let preXPos = preReqPerk.xPos / 100 * svgBoxRect.width;
                let preYPos = preReqPerk.yPos / 100 * svgBoxRect.height;

                let newLine = newPerkLine(svgBox, curXPos, curYPos, preXPos, preYPos, 4);
                perk.lines.push(newLine);
            }
        }
    }

    for (let i = 0; i < activeSkillTree.perks.length; i++) {

        let perk  = activeSkillTree.perks[i];
        let curXPos = perk.xPos / 100 * svgBoxRect.width;
        let curYPos = perk.yPos / 100 * svgBoxRect.height;
        //Filter out previous ranks of perks, drawing circle for only final rank
        //We'll later check if previous ranks have been added when clicking on perk
        //and add the ranks one at a time.

        if (perk.chain == 0 || perk.rank == 1) {      
            let perkName = perk.name;
            let id = perkName.replace(/\s+/g, '') + '-circle';
            id = id.replace("<br>",'');
            newCircle = drawStar(curXPos, curYPos, id);
            newCircle.setAttribute("onclick", "perkClick(this,"+i+")");
            newCircle.setAttribute("onmouseenter", "perkMouseEnter("+i+")");
            newCircle.setAttribute("onmouseleave", "perkMouseExit()");
            perk.circle = newCircle;

            /*let newCircle = newPerkCircle(svgBox, 10, curXPos, curYPos, i, id);
            newCircle.setAttribute("onclick", "perkClick(this,"+i+")");
            newCircle.setAttribute("onmouseenter", "perkMouseEnter("+i+")");
            newCircle.setAttribute("onmouseleave", "perkMouseExit()");
            perk.circle = newCircle;*/
        }

        //Create perk labels
        let perkName = perk.name;
        let id = perkName.replace(/\s+/g, '') + '-label';
        id = id.replace("<br>",'');
        if (perk.chain == 0 || perk.rank == 1) {

            if (perkName.indexOf('<br>') != -1) {
                let perkNameLines = perkName.split('<br>');
                let newLabel = newPerkLabel(curXPos, curYPos, perkNameLines[0], id);
                perk.labels.push(newLabel);
                let parent = document.getElementById(id);
                let newLabelLine = newPerkLabelLine(curXPos, perkNameLines[1], parent);
                perk.labels.push(newLabelLine);
    
            } else {
                let newLabel = newPerkLabel(curXPos, curYPos, perkName, id); 
                perk.labels.push(newLabel);
            }
    
            //Add ranks to labels
            if (perk.chain != 0) {
                let maxRank = perk.chain;
                let rankText = "0/"+maxRank;
                let parent = document.getElementById(id);
                let newLabelLine = newPerkLabelLine(curXPos, rankText, parent); 
                perk.labels.push(newLabelLine);
            }
        }
        if (activeSkillTree.takenPerks.includes(perk)) {
            if (perk.chain == 0 || perk.rank == 1){ 
                takePerkCSS(perk);
            }
        }
    }
    updatePerkRankLabels();
    updateSkillLists();
    updateLevel();
}

function updateSkillLists() {
    for (i = 0; i < skillsList.length; i++) {
        let skill = skillsList[i];
        let highestSkillReq = 0;
        for (j = 0; j < skill.takenPerks.length; j++) {
            if (skill.takenPerks[j].skillReq > highestSkillReq) {
                highestSkillReq = skill.takenPerks[j].skillReq;
            }
        }   

        if (highestSkillReq > skill.levelBase) {
            skill.levelTotal = highestSkillReq;
        } else {
            skill.levelTotal = skill.levelBase;
        }
        //console.log(skill);
    }
    updateActiveSkillInfo();
    updateLevel();
}

function updateActiveSkillInfo() {
    let levelDisplay = document.getElementById("skill-level-total");
    let skillTitle = document.getElementById("skill-title");
    levelDisplay.textContent = activeSkillTree.levelTotal;
    skillTitle.textContent = activeSkillTree.name;
}

function updateLevel() {
    let levelText = document.getElementById("build-info-level-value");

    let levelForPerks = 1;
    let levelForFeats = 0;
    let spentPerks = 0;

    for (i = 0; i < skillsList.length; i++) {
        spentPerks = spentPerks + skillsList[i].takenPerks.length;
        for (j = 0; j < skillsList[i].takenPerks.length; j++) {
            let thisPerk = skillsList[i].takenPerks[j]; 
            if (thisPerk.levelReq != null && thisPerk.levelReq > levelForFeats) {
                levelForFeats = thisPerk.levelReq;
            }
        }
    }

    if (spentPerks > 3) {
        levelForPerks = spentPerks - 2;
    }

    let levelForSP = calculateLevelFromSkillPoints();

    let level = 1;

    if (levelForPerks > levelForSP) {
        level = levelForPerks;
    } else {
        level = levelForSP;
    }
    if (levelForFeats > level) {
        level = levelForFeats;
    }

    buildLevel = level;
    levelText.textContent = " "+level;
    totalAttributePoints = level - 1;
    unspentPerks = (level + 2) - spentPerks;
    updateAttributes();
}

function calculateSkillPointsNeeded() {
// skill 5 to 25 = 60 skill points
// 5 to 50 = 235 points
// 20*3 = 60, 25 * 7 = 175

    let costTo25 = 3;
    let costTo50 = 7;
    let costTo75 = 13;
    let costTo100 = 25;
    
    let skillPoints = 0;

    for (j = 0; j < skillsList.length; j++) {
        let skillLevel = skillsList[j].levelTotal;
        let skillLevelBase = skillsList[j].levelBase;
    
        if (skillLevel != skillLevelBase) {
            for (i = skillLevelBase; i < skillLevel; i++) {
                if (i >= 75) { 
                    skillPoints += costTo100; //console.log("i = " + i + "cost: " + costTo100);
                }
                else if (i >= 50) { 
                    skillPoints += costTo75; //console.log("i = " + i + "cost: " + costTo75);
                }
                else if (i >= 25) { 
                    skillPoints += costTo50; //console.log("i = " + i + "cost: " + costTo50);
                }
                else { 
                    skillPoints += costTo25; //console.log("i = " + i + "cost: " + costTo25);
                };
            }
        }    
    }
    //console.log("skillpoints needed: " + skillPoints);
    return skillPoints;
}

function calculateLevelFromSkillPoints() {
    let skillPointsRequired = calculateSkillPointsNeeded(); 

    let level = 1;

    if (skillPointsRequired > 0) {
        level = 2;
        let skillPoints = 0;
    
        for (i = 0; skillPoints <= skillPointsRequired; i++) {
            skillPoints += 12 + (level*3);

            level++;
            //console.log("skill points:" + skillPoints +" level: " + (level-1));
        }

        level--; //fix level being 1 more than needed
    }
    
    return level; 
    //console.log("level: "+ level);
}

function levelToSkillPoints(level) {
    let skillPoints = 12 + (level*3);
    return skillPoints;
}

function increaseAttribute(i) {
    if (unspentAttributes != 0) {
        attributeIncreases[i]++;
        spentAttributes++;
        updateAttributes();
    }
}
function decreaseAttribute(i) {
    if (attributeIncreases[i] != 0) {
        attributeIncreases[i]--;
        spentAttributes--;
        updateAttributes();
    }
}

function updateAttributes() {
    unspentAttributes = totalAttributePoints - spentAttributes;
    let unspentAttributesText = document.getElementById("attribute-points-unspent");
    unspentAttributesText.textContent = unspentAttributes;

    let magickaTotal = document.getElementById("magicka-total");
    let healthTotal = document.getElementById("health-total");
    let staminaTotal = document.getElementById("stamina-total");

    let magickaBase = document.getElementById("magicka-base");
    let healthBase = document.getElementById("health-base");
    let staminaBase = document.getElementById("stamina-base");

    let attributeText = [magickaTotal, healthTotal, staminaTotal];
    let attributeBase = [magickaBase, healthBase, staminaBase];

    for (i = 0; i < 3; i++) {
        attributeTotals[i] = race.baseAttributes[i] + (5 * attributeIncreases[i]) + race.bonusAttributes[i];
        attributeText[i].textContent = attributeTotals[i];

        attributeBase[i].textContent = "BASE: " + (race.baseAttributes[i] +(5 * attributeIncreases[i]));
    }
    updateDerivedValues();
    saveData();
}

function updateRace() {
    race = raceList[document.getElementById("races-selection").selectedIndex];

    for(i = 0; i < skillsList.length; i++) {
        skillsList[i].levelBase = race.baseSkills[i];
    }    

    drawSkillTree();
    updateAttributes();
}

function updateStone() {
    saveData();
}

function updateBlessing() {
    saveData();
}


function createSkillIcons() {
    for (i = 0; i < skillsIconsSVG.length; i++) {
        drawSkillIcons(skillsIconsSVG[i], i);
    }
}

function updateSkillIcons() {
    skillsList.forEach(skill => {
        for (i=0; skill.takenPerks.length; i++) {
            takePerkCSS(skill.takenPerks[i]);
        }
    });
}

function drawSkillIcons(skillsSvgBox, i) {
    //Get SVG area
    let svgBoxRect = skillsSvgBox.getBoundingClientRect();
    let skillTree = skillsList[i];
    
    //Run through each perk in skillTree
    for (let i = 0; i < skillTree.perks.length; i++) {

        let perk  = skillTree.perks[i];
        let curXPos = perk.xPos / 100 * svgBoxRect.width;
        let curYPos = perk.yPos / 100 * svgBoxRect.height;

        //Draw lines first, so circles draw on top
        //Only draw lines for 1 perk from each rank, we'll use the last as it's easier to filter

        if(perk.preReqs.length != 0) {
            //loop through required perks
            for (let j = 0; j < perk.preReqs.length; j++) {
                let preReqsNum = perk.preReqs[j];
                let preReqPerk = skillTree.perks[preReqsNum]; //This is the required perk for current perk

                let preXPos = preReqPerk.xPos / 100 * svgBoxRect.width;
                let preYPos = preReqPerk.yPos / 100 * svgBoxRect.height;

                let newLine = newPerkLine(skillsSvgBox, curXPos, curYPos, preXPos, preYPos, 2);
                perk.lines.push(newLine);
            }
        }
    }

    for (let p = 0; p < skillTree.perks.length; p++) {

        let perk  = skillTree.perks[p];
        let curXPos = perk.xPos / 100 * svgBoxRect.width;
        let curYPos = perk.yPos / 100 * svgBoxRect.height;
        //Filter out previous ranks of perks, drawing circle for only final rank
        //We'll later check if previous ranks have been added when clicking on perk
        //and add the ranks one at a time.

        if (perk.chain == 0 || perk.rank == 1) {      
            let perkName = perk.name;
            let id = perkName.replace(/\s+/g, '') + '-circle-skills';
            id = id.replace("<br>",'');
            let newCircle = newPerkCircle(skillsSvgBox, 3, curXPos, curYPos, p, id);
            perk.iconCircle = newCircle;
        }

        if (skillTree.takenPerks.includes(perk)) {
            if (perk.chain == 0 || perk.rank == 1){ 
                takePerkCSS(perk);
            }
        }
    }
}

function saveData() {
  
    let takenPerks = [];

    for (i = 0; i < skillsList.length; i++) {
        if (skillsList[i].takenPerks[0] != null) {
            let skillString = i;
            for (j = 0; j < skillsList[i].takenPerks.length; j++) {
                let perk = skillsList[i].takenPerks[j];
                let id = skillsList[i].perks.indexOf(perk);
                skillString += "p" +id;
            }
            takenPerks.push(skillString);
        }
    }

    let name = document.getElementById("build-name").value;
    let raceIndex = document.getElementById("races-selection").value;
    let stoneIndex = document.getElementById("stone-select").value;
    let blessingIndex = document.getElementById("blessing-select").value;
    let perksString = takenPerks.toString();
    perksString = perksString.replace(/,/g,'s'); //replace commas so we can split seperately
    if(perksString.length == 0) { perksString = 'noPerks'};
    let codeArray = [name, raceIndex, stoneIndex, blessingIndex, attributeIncreases[0], attributeIncreases[1], attributeIncreases[2], perksString];
    let code = codeArray.toString();
    let codeEncoded = btoa(code);

    //remove padding '=' chars
    if(codeEncoded.indexOf("=") != -1){
        codeEncoded = codeEncoded.replace(/=/g,'');
    }

    //updateBuildCode
    let baseUrl = window.location.href.split('?')[0];
    let theURL = new URL(baseUrl);
    theURL.searchParams.set('b', codeEncoded);

    let buildCodeDiv = document.getElementById("build-code");
    buildCodeDiv.textContent = theURL;

}

function loadData() {
    const queryString = window.location.search; 
    const urlParams = new URLSearchParams(queryString);
    if(urlParams.has('b')) {
        let code = urlParams.get('b');

        let decoded = atob(code);
    
        let values = decoded.split(',');
        let buildName = values[0];
        let buildRace = values[1];
        let buildStone = values[2];
        let buildBlessing = values[3];
        let magickaIncrease = values[4];
        let healthIncrease = values[5];
        let staminaIncrease = values[6];
    
    
        document.getElementById("build-name").value = buildName;
        document.getElementById("races-selection").value = buildRace;
        document.getElementById("stone-select").value = buildStone;
        document.getElementById("blessing-select").value = buildBlessing;
    
        attributeIncreases[0] = magickaIncrease;
        attributeIncreases[1] = healthIncrease;
        attributeIncreases[2] = staminaIncrease;
    
        spentAttributes = parseInt(attributeIncreases[0]) + parseInt(attributeIncreases[1]) + parseInt(attributeIncreases[2]);
    
        //perks
        if(values[7] != 'noPerks') {
            let buildPerks = values[7].split('s');
            for (i = 0; i < buildPerks.length; i++) {
                let perkArray = buildPerks[i].split('p');
                let skillID = perkArray[0];
                let skillTree = skillsList[skillID];
        
                for (j = 1; j < perkArray.length; j++) {
                    let takenPerk = skillTree.perks[perkArray[j]];
                    skillTree.takenPerks.push(takenPerk);
                    takePerkCSS(takenPerk);
                }
            }
        }
    }
    drawSkillTree();
}

function copyBuildCode() {
    let buildCodeDiv = document.getElementById("build-code");
    let buildCodeButton = document.getElementById("build-copy");
    let buildCode = buildCodeDiv.textContent;
    navigator.clipboard.writeText(buildCode).then(function(){
        buildCodeButton.style.backgroundColor = "rgba(59, 170, 87, 0.8)";
        buildCodeButton.textContent = "Copied!";
        setTimeout(function(){
            buildCodeButton.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
            buildCodeButton.textContent = "Copy Build Code";
        }, 1000);

    }, function() {
        alert("Copy failed, try again or manually copy the build code");
    });
}

function perkMouseEnter(perkNum) {
    let perk = activeSkillTree.perks[perkNum];
    let circle = perk.circle;
    let rankIndex = 0;

    //we need to get the right perk. perk circles all link to the first perk in a chain.
    if (perk.chain != 0) {

        for (i=1; i < perk.chainPerks.length; i++) {
            if(activeSkillTree.takenPerks.includes(perk.chainPerks[i])) {
                rankIndex++;
            }
        }
        console.log(perk);
        perk = perk.chainPerks[rankIndex];
        console.log(perk);
    }

    let title = document.getElementById("perk-description-title");
    let body = document.getElementById("perk-description-body");
    let nextTitle = document.getElementById("perk-description-rank-title");
    let nextBody = document.getElementById("perk-description-rank-body");
    //to reset
    nextTitle.style.display = "none";
    nextBody.style.display = "none";
    
    //set text
    title.textContent = perk.name.replace('<br>', ' ');
    body.textContent = perk.description;

    //if perk is a chain, we need to set next rank text if needed

    if(perk.chain != 0) {
        title.textContent = perk.name.replace('<br>', ' ') + "(" + perk.rank + "/" + perk.chain + ")";

        let showNext = false;

        if (perk.rank == 1 && activeSkillTree.takenPerks.includes(perk)) { showNext = true}
        else if (perk.rank == 2 && perk.chain == 3) { showNext = true}


        if(showNext==true) {
            let nextPerk = activeSkillTree.perks[perkNum+rankIndex+1];    
            nextBody.textContent = nextPerk.description;
            nextTitle.style.display = "block";
            nextBody.style.display = "block";
        }
    }

    //set description colour if perk is taken
    if (activeSkillTree.takenPerks.includes(perk)){
        title.classList.add("taken-perk-tooltip");
        body.classList.add("taken-perk-tooltip");
    } else {
        title.classList.remove("taken-perk-tooltip");
        body.classList.remove("taken-perk-tooltip");
    }
    
    //show tooltip box    
    let rect = circle.getBoundingClientRect();
    let tooltipBox = document.getElementById("perk-description-box");
    tooltipBox.style.display = "block"

    //position tooltip box
    let boxHeight = tooltipBox.offsetHeight;
    let boxWidth = tooltipBox.offsetWidth;

    tooltipBox.style.left = (rect.left-(boxWidth/2)+15).toString() +"px";


    tooltipBox.style.top = (rect.top+50).toString() +"px";
}

function perkMouseExit() {
    let tooltipBox = document.getElementById("perk-description-box");
    let nextTitle = document.getElementById("perk-description-rank-title");
    let nextBody = document.getElementById("perk-description-rank-body");
    tooltipBox.style.display = "none";
    nextTitle.style.display = "none";
    nextBody.style.display = "none";
}

function clearSkill() {
    let perksToRemove = [];
    activeSkillTree.takenPerks.forEach(perk => {
        perksToRemove.push(perk);
    });

    for (rp = 0; rp < perksToRemove.length; rp++) {
        
        if (perksToRemove[rp].chain == 0 || perksToRemove[rp].rank == 1) 
        {
            removePerk2(perksToRemove[rp]);
        }
        else {
            (removePerkRank(perksToRemove[rp])); 
        };
    }
    drawSkillTree();
}

function clearAllSkills(){
   /*let url = window.location.href.split('?')[0];
   window.location = url;*/
   let perksToRemove = [];

    skillsList.forEach(skill => {
        skill.takenPerks.forEach(perk => {
        perksToRemove.push(perk); });
    });

    for (rp = 0; rp < perksToRemove.length; rp++) {
        
        if (perksToRemove[rp].chain == 0 || perksToRemove[rp].rank == 1) 
        {
            removePerk2(perksToRemove[rp]);
        }
        else {
            (removePerkRank(perksToRemove[rp])); 
        };
    }

    attributeIncreases = [0,0,0];
    spentAttributes = 0;
    drawSkillTree();
}

function closeAlert() {
    let alertDiv = document.getElementById("alert");
    alertDiv.style.display = "none";
}

addChainArrays();
drawSkillTree();
createSkillIcons();
updateRace();
loadData();