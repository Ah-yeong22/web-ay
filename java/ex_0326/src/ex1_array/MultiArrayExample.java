package ex1_array;

import java.util.Scanner;

public class MultiArrayExample {
	public static void main(String[] args) {
		//2차원 배열 : 1차원 배열을 요소로 갖는 배열
		//2차원 배열의 초기화
		int [][] arr = {{1,2,3},{4,5,6},{5,6,7},};
		
		//2차원 배열의 선언과 생성
		int[][] ar = new int[2][3];
		
		//배열의 각 공간에 접근하는 방법
		 System.out.println(arr[1][1]);
		 
		 //arr.length:2차원 배열의 길이
		 //arr[i].length: 해당 1차원 배열의 길이
		 for(int i =0; i <arr.length; i++) {
			 for(int j=0; j <arr[i].length;j++) {
				 System.out.println(arr[i][j]);
			 }
		 }
		 
		 //각 1차원 배열에 들어가는 데이터의 개수가 다른 경우 
		 
		 //2차원 배열에 들어가는 요소의 개수만 일단 지정
		 int[][] iAr = new int[3][];
		 
		 //각 1차원 배열의 들어가는 데이터의 개수를 따로 지정 가능
		 iAr[0] = new int[1];
		 iAr[1] = new int[2];
		 iAr[2] = new int[3];
		 
		 iAr[0][0] = 100;
		 iAr[1][0] = 200;
		 iAr[1][1] = 300;
		 iAr[2][0] = 400;
		 iAr[2][1] = 500;
		 iAr[2][2] = 600;
		 
		 
		 System.out.println("------------------------");
		 
		 int[][] num = {{1},{2,3},{4,5,6},{7,8,9,10}};
		 
		 int sum =0;
		 for(int i=0; i<num.length; i++) {
			 for(int j=0; j < num[i].length; j++) {
				 sum += num[i][j];
			 }
			 
		 }System.out.println(sum);
		 
		 System.out.println("-------------------------");
		 
		 Scanner sc = new Scanner(System.in);
		 System.out.println("몇명의 학생의 정보를 저장할건가요 : ");
	      int n = sc.nextInt();
	      
	      String[][] str = new String[n][3];
	      
	      for(int i = 0; i < str.length; i++) {
	         System.out.print("이름 : ");
	         str[i][0] = sc.next();
	         System.out.print("수학 : ");
	         str[i][1] = sc.next();
	         System.out.print("영어 : ");
	         str[i][2] = sc.next();
	         System.out.println("------------------");
	      }
	      
	      System.out.println(str.length+"명 등록완료!");
	      for(int i = 0; i < str.length; i++) {
	         for(int j = 0; j <str[i].length; j++) {
	            System.out.print(str[i][j] + " ");
	         }
	         System.out.println();
	      }
	      
	      int[] scores = {1,2,3,4,5,6};
	      
	      int sum2 = 0;
	      
	      for(int score : scores) {
	    	  sum =+ score;
	      }System.out.println("총 합 : " +sum2);
	}
}
