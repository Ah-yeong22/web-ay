package ex1_array;

import java.util.Scanner;

public class ArrayExample {
	public static void main(String[] args) {

		char[] cards = { '1', 'L', 'O', '2', 'V', '3', 'E' };
		String str = " ";

		for (int i = 0; i < cards.length; i++) {
			int word = cards[i];
			if ((word >= 60 && word <= 90) || (word >= 97 && word <= 122)) {
				str += (char) word;

			}
		}
		System.out.println(str);

		System.out.println("-------------------------------");

		int money = (int) ((Math.random() * 500 + 1)) * 10;
		int[] coin = { 500, 100, 50, 10 };
		System.out.println(money);

		int count = 0;

		for (int i = 0; i < coin.length; i++) {
			int res = money / coin[i];
			System.out.println(coin[i] + "원:" + res);
			money = money % coin[i];

		}
		System.out.println("-------------------------------");

		Scanner sc = new Scanner(System.in);
		System.out.println("배열 길이 입력 : ");
		char[] ar;
		ar = new char[sc.nextInt()];
		for (int i = 0; i < ar.length; i++) {
			ar[i] = (char) ('A' + i);
		}
		System.out.println(ar);
		
		System.out.println("-------------------------------");
		
		 int [] lotto = new int[6];
	      
	      //배열의 길이만큼 반복
	      outer:for(int i = 0; i < lotto.length;) {
	         
	         //난수를 하나 뽑아 배열에 저장
	         lotto[i] = (int)(Math.random()*45+1);
	         
	         //중복이 있는지 검사
	         for(int j = 0; j < i; j++) {
	            //같은게 있다면
	            if(lotto[i] == lotto[j]) {
	               //다시 뽑아야한다.
	               continue outer;
	            }
	         }
	         System.out.print(lotto[i]+" ");
	         i++;
	      }//outer
		}
	}

