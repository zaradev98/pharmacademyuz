 nums = [1, 3, 5, 6], target = 2
 let left = 0;
 let right= nums.length()-1;
 while(left<=right){
    let mid=Math.floor((left+right)/2)
    if(nums[mid]==target){
        return mid;
    }
     
    else if(nums[mid]<target){
        if(right-left==1){
        return left-1
    }
        else{
            left=mid+1
        }
    }
    else if(nums[mid]>target){
        if(right-left==1){
        return left+1
    }
        else{
            right=mid-1
        }
    }
   
 }