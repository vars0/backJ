#include <iostream>
#include <vector>

int main(int argc, char **argv)
{
  int N;
  std::cin >> N;
  int T[N][3];

  for (int i = 0; i < N; i++)
  {
    std::cin >> T[i][0] >> T[i][1] >> T[i][2];
  }


  return 0;
}

