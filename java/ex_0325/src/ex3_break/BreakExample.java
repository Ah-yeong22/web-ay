package ex3_break;

import java.util.Scanner;

public class BreakExample {
	public static void main(String[] args) {
		
//		int rand = (int)(Math.random()*45) +1;
//		
		Scanner sc = new Scanner(System.in);
//		int answer;
		
//		while(true) {
//			System.out.println("정답 :");
//			answer = sc.nextInt();
//			//입력받은 answer이랑 난수랑 일치하면 반복문 빠져나가기
//			if(answer == rand) {
//				break;
//			}
//		}
//		
//		int magicNumber = (int)(Math.random()*50)+1;
//	      
//	      boolean isMatched = false;
//	      
//	      
//	      for(int i = 0; i < 10; i++) {
//	         System.out.print("찾는 숫자를 입력 >> ");
//	         int guess = sc. nextInt();
//	         
//	         if(guess == magicNumber) {
//	            System.out.println((i+1)+"번째에 맞췄습니다.");
//	            isMatched = true;
//	            break;
//	         } else if(guess < magicNumber) {
//	            System.out.println("up");
//	         } else if(guess > magicNumber) {
//	            System.out.println("down");
//	         }
//	      }
//	      
//	      if(!isMatched) {
//	         System.out.println("정답을 맞추지 못했습니다.");
//	      }
//	      
	      //라벨
	      outer:for(int i = 1; i <=5; i++) {
	    	  for(int j = 1; j <=5; j++) {
	    		  System.out.println(i+" " +j);
	    		  if(j==3) {
	    			  
	    			  break outer;
	    		  }
	    	  }
	      }
	}
}
