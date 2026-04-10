package exma0410;

public class AverageTest {
	   public static void main(String[] args) {
	       int[] scores = {80, 90, 75, 100};
	       double sum = 0;

	       // 오류 발생 지점 [A]
	       for (int i = 0; i < scores.length; i++) {
	           sum += scores[i];
	       }

	       // 오류 발생 지점 [B]
	       double average = sum / scores.length;

	       System.out.println("평균 점수: " + average);
	   }
	}